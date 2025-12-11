"""
Unit tests for MasterAgent enhancements:
- Abandonment detection
- KYC escalation
- Offer negotiation
- Event logging
"""
import unittest
import json
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from agents.master import MasterAgent
from agents.database import (
    init_database, create_session, get_session, update_session,
    log_event, get_session_events, escalate_session, get_escalations,
    increment_kyc_failures, check_abandonment, DATABASE_FILE
)


class TestMasterAgentAbandonment(unittest.TestCase):
    """Test cases for customer abandonment detection."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.agent = MasterAgent()
        self.session_id = "test_session_abandonment"
        # Clean up database before each test
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
        init_database()
    
    def tearDown(self):
        """Clean up after tests."""
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
    
    def test_detects_abandoned_session(self):
        """Test that system detects abandoned sessions (no activity > timeout)."""
        # Create session
        create_session(self.session_id)
        session = get_session(self.session_id)
        self.assertIsNotNone(session)
        
        # Manually set created_at to old timestamp (30 minutes ago)
        old_time = (datetime.now() - timedelta(minutes=30)).isoformat()
        import sqlite3
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE sessions SET updated_at = ? WHERE session_id = ?',
            (old_time, self.session_id)
        )
        conn.commit()
        conn.close()
        
        # Check abandonment (should return True)
        is_abandoned = check_abandonment(self.session_id, timeout_seconds=900)  # 15 min
        self.assertTrue(is_abandoned, "Session should be detected as abandoned")
    
    def test_active_session_not_abandoned(self):
        """Test that active sessions are not flagged as abandoned."""
        create_session(self.session_id)
        
        # Session just created, so should be active
        is_abandoned = check_abandonment(self.session_id, timeout_seconds=900)
        self.assertFalse(is_abandoned, "Recent session should not be abandoned")
    
    def test_abandonment_flag_set_on_response(self):
        """Test that abandonment response contains proper structure."""
        create_session(self.session_id)
        
        # Mark as abandoned
        old_time = (datetime.now() - timedelta(minutes=30)).isoformat()
        import sqlite3
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE sessions SET updated_at = ? WHERE session_id = ?',
            (old_time, self.session_id)
        )
        conn.commit()
        conn.close()
        
        # Get abandonment response
        response = self.agent._create_abandonment_response(self.session_id)
        
        self.assertEqual(response['type'], 'action')
        self.assertEqual(response['payload']['action_type'], 'session_expired')
        self.assertIn('session has expired', response['payload']['message'].lower())


class TestMasterAgentKYCEscalation(unittest.TestCase):
    """Test cases for KYC verification and escalation."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.agent = MasterAgent()
        self.session_id = "test_session_kyc"
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
        init_database()
    
    def tearDown(self):
        """Clean up after tests."""
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
    
    def test_kyc_failure_increments_counter(self):
        """Test that KYC failures are tracked."""
        create_session(self.session_id)
        
        # Increment KYC failures
        count1 = increment_kyc_failures(self.session_id)
        self.assertEqual(count1, 1)
        
        count2 = increment_kyc_failures(self.session_id)
        self.assertEqual(count2, 2)
        
        count3 = increment_kyc_failures(self.session_id)
        self.assertEqual(count3, 3)
    
    def test_escalation_after_threshold(self):
        """Test that session escalates after KYC failure threshold."""
        create_session(self.session_id)
        
        # Simulate 3 KYC failures
        for i in range(3):
            increment_kyc_failures(self.session_id)
        
        # Should trigger escalation at threshold (3)
        escalation_id = escalate_session(
            self.session_id, 
            'kyc_failures',
            'Multiple failed KYC attempts'
        )
        
        self.assertGreater(escalation_id, 0)
        
        # Verify escalation was recorded
        escalations = get_escalations(self.session_id)
        self.assertEqual(len(escalations), 1)
        self.assertEqual(escalations[0]['reason'], 'kyc_failures')
    
    def test_escalation_response_structure(self):
        """Test that escalation response has correct structure."""
        response = self.agent._create_escalation_response(
            self.session_id,
            'kyc_failures',
            'Failed 3 KYC attempts'
        )
        
        self.assertEqual(response['type'], 'action')
        self.assertEqual(response['payload']['action_type'], 'escalated')
        self.assertIn('support team', response['payload']['message'].lower())
        self.assertGreater(len(response['ui_actions']), 0)
        self.assertEqual(response['ui_actions'][0]['action'], 'show_escalation')
    
    def test_kyc_failure_response_with_remaining_attempts(self):
        """Test KYC failure response shows remaining attempts."""
        response = self.agent._create_kyc_failure_response(remaining=2)
        
        self.assertEqual(response['type'], 'action')
        self.assertEqual(response['payload']['action_type'], 'kyc_failure')
        self.assertEqual(response['payload']['attempts_remaining'], 2)
        self.assertIn('2', response['payload']['message'])


class TestMasterAgentNegotiation(unittest.TestCase):
    """Test cases for offer negotiation."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.agent = MasterAgent()
        self.session_id = "test_session_negotiation"
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
        init_database()
    
    def tearDown(self):
        """Clean up after tests."""
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
    
    def test_negotiation_request_detection(self):
        """Test that negotiation requests are properly detected."""
        test_cases = [
            ("Can I get a lower EMI?", True),
            ("Is there a cheaper option?", True),
            ("Can we negotiate the monthly payment?", True),
            ("I want a different tenure", True),
            ("What is the interest rate?", False),
            ("Tell me about the loan", False),
        ]
        
        for message, should_detect in test_cases:
            is_negotiation = self.agent._is_negotiation_request(message)
            self.assertEqual(is_negotiation, should_detect,
                           f"Failed for message: {message}")
    
    def test_negotiation_response_structure(self):
        """Test negotiation response has proper structure."""
        create_session(self.session_id)
        update_session(self.session_id, loan_amount=500000)
        
        response = self.agent._handle_negotiation(
            self.session_id,
            "Can I get a lower EMI?"
        )
        
        self.assertEqual(response['type'], 'action')
        self.assertEqual(response['payload']['action_type'], 'negotiate_offer')
        self.assertIn('suggestions', response['payload'])
        self.assertEqual(len(response['payload']['suggestions']), 3)
        self.assertIn('tenure', response['payload']['suggestions'][0])
        self.assertIn('estimated_emi', response['payload']['suggestions'][0])
        self.assertIn('benefit', response['payload']['suggestions'][0])
    
    def test_alternate_tenure_suggestions(self):
        """Test that alternate tenure suggestions are provided."""
        create_session(self.session_id)
        update_session(self.session_id, loan_amount=1000000)
        
        response = self.agent._handle_negotiation(self.session_id, "Lower EMI?")
        
        tenures = [s['tenure'] for s in response['payload']['suggestions']]
        self.assertIn(24, tenures)
        self.assertIn(36, tenures)
        self.assertIn(60, tenures)
        
        # Verify EMI decreases with longer tenure
        emis = [s['estimated_emi'] for s in response['payload']['suggestions']]
        self.assertGreater(emis[0], emis[1], "EMI should decrease with longer tenure")


class TestMasterAgentEventLogging(unittest.TestCase):
    """Test cases for event logging and audit trail."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.agent = MasterAgent()
        self.session_id = "test_session_logging"
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
        init_database()
    
    def tearDown(self):
        """Clean up after tests."""
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
    
    def test_event_logging_creation(self):
        """Test that events are logged to database."""
        create_session(self.session_id)
        
        event_id = log_event(
            self.session_id,
            'message_received',
            'SalesAgent',
            'User sent message',
            'Hello, I need a loan'
        )
        
        self.assertGreater(event_id, 0)
    
    def test_event_retrieval(self):
        """Test that logged events can be retrieved."""
        create_session(self.session_id)
        
        # Log multiple events
        log_event(self.session_id, 'message_received', 'SalesAgent', 'Message 1', 'Input 1')
        log_event(self.session_id, 'kyc_failure', 'VerificationAgent', 'KYC failed', 'Input 2')
        log_event(self.session_id, 'escalation', 'MasterAgent', 'Escalated', 'Input 3')
        
        # Retrieve all events
        events = get_session_events(self.session_id)
        self.assertEqual(len(events), 3)
        
        # Retrieve filtered events
        kyc_events = get_session_events(self.session_id, 'kyc_failure')
        self.assertEqual(len(kyc_events), 1)
        self.assertEqual(kyc_events[0]['event_type'], 'kyc_failure')
    
    def test_event_contains_timestamp(self):
        """Test that events have timestamps."""
        create_session(self.session_id)
        
        before = datetime.now()
        log_event(self.session_id, 'test_event', 'TestAgent', 'Test message')
        after = datetime.now()
        
        events = get_session_events(self.session_id)
        self.assertEqual(len(events), 1)
        
        # Verify timestamp is within expected range
        event_time = datetime.fromisoformat(events[0]['timestamp'])
        self.assertGreaterEqual(event_time, before)
        self.assertLessEqual(event_time, after)
    
    def test_event_status_tracking(self):
        """Test that event status is tracked correctly."""
        create_session(self.session_id)
        
        log_event(self.session_id, 'normal_event', 'Agent1', 'OK', status='normal')
        log_event(self.session_id, 'warning_event', 'Agent2', 'Warn', status='warning')
        log_event(self.session_id, 'error_event', 'Agent3', 'Err', status='error')
        
        events = get_session_events(self.session_id)
        statuses = [e['status'] for e in events]
        
        self.assertIn('normal', statuses)
        self.assertIn('warning', statuses)
        self.assertIn('error', statuses)
    
    def test_audit_trail_completeness(self):
        """Test that audit trail captures complete workflow."""
        create_session(self.session_id)
        
        # Simulate complete workflow
        events_to_log = [
            ('message_received', 'MasterAgent', 'User initiated', 'START_SESSION'),
            ('message_processed', 'SalesAgent', 'Loan form shown', None),
            ('message_received', 'MasterAgent', 'User filled form', '500000'),
            ('kyc_failure', 'VerificationAgent', 'KYC failed - invalid PAN', 'Invalid PAN'),
            ('escalation', 'MasterAgent', 'Escalated after failures', None),
        ]
        
        for event_type, agent, message, user_input in events_to_log:
            log_event(self.session_id, event_type, agent, message, user_input)
        
        # Verify all events logged
        all_events = get_session_events(self.session_id)
        self.assertEqual(len(all_events), len(events_to_log))
        
        # Verify order (most recent first due to ORDER BY DESC)
        self.assertEqual(all_events[0]['event_type'], 'escalation')
        self.assertEqual(all_events[-1]['event_type'], 'message_received')


class TestMasterAgentIntegration(unittest.TestCase):
    """Integration tests for complete scenarios."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.agent = MasterAgent()
        self.session_id = "test_session_integration"
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
        init_database()
    
    def tearDown(self):
        """Clean up after tests."""
        if os.path.exists(DATABASE_FILE):
            os.remove(DATABASE_FILE)
    
    def test_abandonment_scenario(self):
        """Test complete abandonment scenario."""
        # Create session
        create_session(self.session_id)
        
        # Log initial activity
        log_event(self.session_id, 'message_received', 'SalesAgent', 'Session started')
        
        # Simulate time passage
        old_time = (datetime.now() - timedelta(minutes=20)).isoformat()
        import sqlite3
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE sessions SET updated_at = ? WHERE session_id = ?',
            (old_time, self.session_id)
        )
        conn.commit()
        conn.close()
        
        # Detect abandonment
        is_abandoned = check_abandonment(self.session_id, 900)
        self.assertTrue(is_abandoned)
        
        # Log abandonment event
        log_event(self.session_id, 'abandonment', 'MasterAgent', 
                 'Session timeout detected', status='warning')
        
        # Verify audit trail
        events = get_session_events(self.session_id)
        event_types = [e['event_type'] for e in events]
        self.assertIn('abandonment', event_types)
    
    def test_kyc_escalation_scenario(self):
        """Test complete KYC escalation scenario."""
        create_session(self.session_id)
        
        # Simulate 3 failed KYC attempts
        for attempt in range(1, 4):
            log_event(self.session_id, 'kyc_failure', 'VerificationAgent',
                     f'KYC validation failed - attempt {attempt}',
                     f'kyc_data_{attempt}', status='warning')
            increment_kyc_failures(self.session_id)
        
        # Escalate after threshold
        escalate_session(self.session_id, 'kyc_failures',
                        'Multiple failed KYC verification attempts')
        log_event(self.session_id, 'escalation', 'MasterAgent',
                 'Escalated to human support', status='error')
        
        # Verify escalation recorded
        escalations = get_escalations(self.session_id)
        self.assertEqual(len(escalations), 1)
        
        # Verify audit trail
        events = get_session_events(self.session_id)
        self.assertGreater(len(events), 3)
        
        session = get_session(self.session_id)
        self.assertEqual(session['kyc_failures'], 3)
        self.assertEqual(session['escalated_to_human'], 1)
    
    def test_negotiation_scenario(self):
        """Test complete negotiation scenario."""
        create_session(self.session_id)
        update_session(self.session_id, loan_amount=500000)
        
        # User requests negotiation
        log_event(self.session_id, 'negotiation_request', 'SalesAgent',
                 'User requested EMI negotiation',
                 'Can we get a lower monthly payment?', status='normal')
        
        # Agent provides alternate options
        response = self.agent._handle_negotiation(self.session_id, "Lower EMI?")
        
        # Log negotiation response
        log_event(self.session_id, 'negotiation_response', 'SalesAgent',
                 'Alternate tenure options provided',
                 json.dumps(response['payload']), status='normal')
        
        # Verify events logged
        events = get_session_events(self.session_id)
        event_types = [e['event_type'] for e in events]
        self.assertIn('negotiation_request', event_types)
        self.assertIn('negotiation_response', event_types)


if __name__ == '__main__':
    unittest.main()
