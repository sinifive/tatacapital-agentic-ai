"""
Master Agent: Orchestrates worker agents and manages conversation flow.
Includes: abandonment detection, KYC escalation, offer negotiation, and event logging.
"""
import json
import re
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from .workers import SalesAgent, VerificationAgent, UnderwritingAgent, SanctionAgent
from .database import (
    init_database, get_session, create_session, update_session, log_state_transition,
    log_event, get_session_events, escalate_session, get_escalations, 
    increment_kyc_failures, check_abandonment
)

class IntentClassifier:
    """
    Simple rule-based intent classifier for routing messages to appropriate agents.
    """
    
    INTENTS = {
        'greeting': {
            'keywords': ['hello', 'hi', 'hey', 'greetings', 'welcome', 'start'],
            'agent': 'SalesAgent'
        },
        'loan_inquiry': {
            'keywords': ['loan', 'borrow', 'credit', 'interest', 'emi', 'quote', 'rate'],
            'agent': 'SalesAgent'
        },
        'verification': {
            'keywords': ['verify', 'document', 'upload', 'kyc', 'proof', 'certificate', 'aadhar', 'pan'],
            'agent': 'VerificationAgent'
        },
        'approval_status': {
            'keywords': ['status', 'approved', 'eligible', 'eligible', 'decision', 'result'],
            'agent': 'UnderwritingAgent'
        },
        'sanction': {
            'keywords': ['sanction', 'letter', 'download', 'pdf', 'finalize', 'complete'],
            'agent': 'SanctionAgent'
        }
    }
    
    @classmethod
    def classify(cls, message: str, current_agent: str = 'SalesAgent') -> str:
        """
        Classify message intent and return recommended agent.
        
        Args:
            message: User's message
            current_agent: Current agent in conversation
            
        Returns:
            Name of recommended agent
        """
        message_lower = message.lower()
        
        # Check explicit intents with word boundaries for more accurate matching
        for intent, config in cls.INTENTS.items():
            for keyword in config['keywords']:
                # Use word boundary matching with regex for better accuracy
                if re.search(rf'\b{re.escape(keyword)}\b', message_lower):
                    return config['agent']
        
        # Default to current agent if no clear intent
        return current_agent

class MasterAgent:
    """
    Master Agent: Orchestrates multi-agent workflow for loan origination.
    
    Maintains session state, routes messages to appropriate worker agents,
    and manages conversation flow across sales, verification, underwriting, and sanction stages.
    """
    
    def __init__(self):
        """Initialize MasterAgent with worker agents and database."""
        init_database()
        self.agents = {
            'SalesAgent': SalesAgent(),
            'VerificationAgent': VerificationAgent(),
            'UnderwritingAgent': UnderwritingAgent(),
            'SanctionAgent': SanctionAgent()
        }
        self.classifier = IntentClassifier()
        self.abandonment_timeout = 900  # 15 minutes in seconds
        self.kyc_escalation_threshold = 3  # Escalate after 3 failures
    
    def handle_message(self, session_id: str, user_message: str) -> Dict[str, Any]:
        """
        Process user message and return structured response.
        
        Main orchestration method that:
        1. Creates or retrieves session
        2. Classifies message intent
        3. Routes to appropriate worker agent
        4. Updates session state
        5. Returns structured response for frontend
        
        Args:
            session_id: Unique session identifier
            user_message: User's input message
            
        Returns:
            Dictionary with keys:
                - type: 'text', 'form', or 'action'
                - payload: Agent-specific response data
                - session_id: Session identifier
                - timestamp: ISO format timestamp
                - current_agent: Name of agent handling this turn
        
        Note: For compatibility with sync MasterAgent. Use handle_message_async for async operations.
        """
        import asyncio
        # Run async handler in event loop
        try:
            loop = asyncio.get_running_loop()
            # We're already in an event loop (pytest-asyncio case)
            # Create a new event loop in a separate thread
            import concurrent.futures
            import threading
            result = []
            exception = []
            
            def run_in_new_loop():
                new_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(new_loop)
                try:
                    res = new_loop.run_until_complete(self.handle_message_async(session_id, user_message))
                    result.append(res)
                except Exception as e:
                    exception.append(e)
                finally:
                    new_loop.close()
            
            thread = threading.Thread(target=run_in_new_loop)
            thread.start()
            thread.join()
            
            if exception:
                raise exception[0]
            return result[0]
        except RuntimeError:
            # No event loop running, create one
            try:
                loop = asyncio.get_event_loop()
                if loop.is_closed():
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            return loop.run_until_complete(self.handle_message_async(session_id, user_message))
    
    async def handle_message_async(self, session_id: str, user_message: str) -> Dict[str, Any]:
        """
        Async version of handle_message using new worker agent interfaces.
        Includes: abandonment detection, KYC escalation, negotiation handling, and event logging.
        """
        # Create session if it doesn't exist
        session = get_session(session_id)
        if not session:
            create_session(session_id)
            session = get_session(session_id)
        
        # Check for session abandonment
        if self._check_abandonment(session_id):
            log_event(session_id, 'abandonment', 'MasterAgent', 
                     'Session abandoned - no activity timeout', 
                     status='warning')
            return self._create_abandonment_response(session_id)
        
        # Classify intent and determine next agent
        current_agent = session.get('current_agent', 'SalesAgent')
        next_agent = self.classifier.classify(user_message, current_agent)
        
        # Log incoming message
        log_event(session_id, 'message_received', next_agent, 
                 f"Processing message", user_message, status='normal')
        
        # Check if user is requesting EMI negotiation
        if self._is_negotiation_request(user_message):
            negotiation_response = self._handle_negotiation(session_id, user_message)
            log_event(session_id, 'negotiation_request', 'SalesAgent',
                     'User requested EMI negotiation', user_message, status='normal')
            return negotiation_response
        
        # Check for KYC verification failures
        if next_agent == 'VerificationAgent' and not self._validate_kyc_attempt(session_id):
            kyc_failures = increment_kyc_failures(session_id)
            
            log_event(session_id, 'kyc_failure', 'VerificationAgent',
                     f'KYC validation failed (attempt {kyc_failures})',
                     user_message, status='warning')
            
            # Escalate to human if threshold exceeded
            if kyc_failures >= self.kyc_escalation_threshold:
                escalate_session(session_id, 'kyc_failures', 
                               f'Multiple KYC failures ({kyc_failures} attempts)')
                log_event(session_id, 'escalation', 'MasterAgent',
                         'Session escalated due to repeated KYC failures',
                         status='error')
                return self._create_escalation_response(session_id, 
                    'kyc_failures', f'Escalated after {kyc_failures} failed attempts')
            else:
                remaining = self.kyc_escalation_threshold - kyc_failures
                return self._create_kyc_failure_response(remaining)
        
        # Get worker agent and process message
        worker = self.agents.get(next_agent, self.agents['SalesAgent'])
        
        # Convert session to dict if needed
        session_dict = dict(session) if hasattr(session, 'items') else session
        session_dict['session_id'] = session_id
        
        # Create context for worker agent
        context = {
            'session_data': session_dict,
            'user_message': user_message
        }
        
        # Call async handler
        agent_response = await worker.handle(context)
        
        # Update session state
        update_session(
            session_id,
            current_agent=next_agent,
            status='active',
            last_activity=datetime.now().isoformat()
        )
        
        # Log state transition
        log_state_transition(
            session_id,
            next_agent,
            f"Processed: {user_message[:50]}...",
            json.dumps(agent_response.get('payload', {}))
        )
        
        # Log event
        log_event(session_id, 'message_processed', next_agent,
                 agent_response.get('payload', {}).get('message', 'Response generated'),
                 status='normal')
        
        # Return structured response for frontend
        return {
            'session_id': session_id,
            'type': agent_response.get('type', 'text'),
            'payload': agent_response.get('payload', {}),
            'timestamp': datetime.now().isoformat(),
            'current_agent': next_agent,
            'next_agent': agent_response.get('next_agent', next_agent),
            'ui_actions': agent_response.get('ui_actions', [])
        }
    
    def _check_abandonment(self, session_id: str) -> bool:
        """Check if session has been abandoned."""
        return check_abandonment(session_id, self.abandonment_timeout)
    
    def _is_negotiation_request(self, message: str) -> bool:
        """Detect if user is requesting EMI/offer negotiation."""
        negotiation_keywords = [
            'emi', 'lower', 'reduce', 'cheaper', 'less expensive', 
            'negotiate', 'payment', 'monthly', 'cheaper option', 
            'lower rate', 'alternate', 'different tenure'
        ]
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in negotiation_keywords)
    
    def _validate_kyc_attempt(self, session_id: str) -> bool:
        """Validate KYC attempt (mock implementation)."""
        # In real implementation, would validate against actual KYC data
        # For now, return True (valid) - failure detection happens in agent
        return True
    
    def _handle_negotiation(self, session_id: str, message: str) -> Dict[str, Any]:
        """Handle offer negotiation request."""
        session = get_session(session_id)
        loan_amount = session.get('loan_amount') or 0
        
        # Safety check - ensure loan_amount is a number
        try:
            if loan_amount is None:
                loan_amount = 500000  # Default fallback
            else:
                loan_amount = float(loan_amount)
        except (ValueError, TypeError):
            loan_amount = 500000
        
        # Generate alternate tenure options
        alternate_tenures = [24, 36, 48, 60]
        
        return {
            'session_id': session_id,
            'type': 'action',
            'payload': {
                'message': 'I can help you find a better EMI option! Here are alternate tenure suggestions:',
                'action_type': 'negotiate_offer',
                'loan_amount': loan_amount,
                'alternate_tenures': alternate_tenures,
                'suggestions': [
                    {
                        'tenure': 24,
                        'estimated_emi': loan_amount * 0.05,  # Mock calculation
                        'benefit': 'Lower total interest'
                    },
                    {
                        'tenure': 36,
                        'estimated_emi': loan_amount * 0.035,
                        'benefit': 'Balanced EMI'
                    },
                    {
                        'tenure': 60,
                        'estimated_emi': loan_amount * 0.022,
                        'benefit': 'Lower monthly payment'
                    }
                ]
            },
            'timestamp': datetime.now().isoformat(),
            'current_agent': 'SalesAgent',
            'next_agent': 'SalesAgent',
            'ui_actions': [
                {
                    'action': 'show_negotiation_options',
                    'tenures': alternate_tenures
                }
            ]
        }
    
    def _create_abandonment_response(self, session_id: str) -> Dict[str, Any]:
        """Create response for abandoned session."""
        update_session(session_id, status='abandoned', abandonment_timeout=1)
        return {
            'session_id': session_id,
            'type': 'action',
            'payload': {
                'message': 'Your session has expired due to inactivity. Please start a new session to continue.',
                'action_type': 'session_expired'
            },
            'timestamp': datetime.now().isoformat(),
            'current_agent': 'MasterAgent',
            'ui_actions': [
                {
                    'action': 'show_error',
                    'title': 'Session Expired',
                    'message': 'Please refresh and start a new application'
                }
            ]
        }
    
    def _create_kyc_failure_response(self, remaining: int) -> Dict[str, Any]:
        """Create response for KYC failure with retry count."""
        return {
            'type': 'action',
            'payload': {
                'message': f'KYC verification failed. Please try again. ({remaining} attempts remaining)',
                'action_type': 'kyc_failure',
                'attempts_remaining': remaining
            },
            'timestamp': datetime.now().isoformat(),
            'current_agent': 'VerificationAgent',
            'ui_actions': [
                {
                    'action': 'show_warning',
                    'message': f'KYC failed - {remaining} retries left before escalation'
                }
            ]
        }
    
    def _create_escalation_response(self, session_id: str, reason: str, details: str) -> Dict[str, Any]:
        """Create response for escalated session."""
        return {
            'session_id': session_id,
            'type': 'action',
            'payload': {
                'message': 'Your case has been escalated to our support team. A representative will contact you shortly.',
                'action_type': 'escalated',
                'reason': reason,
                'details': details
            },
            'timestamp': datetime.now().isoformat(),
            'current_agent': 'MasterAgent',
            'ui_actions': [
                {
                    'action': 'show_escalation',
                    'title': 'Case Escalated',
                    'message': 'A human specialist will contact you within 2 hours.'
                }
            ]
        }
    
    def get_session_state(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve current session state.
        
        Args:
            session_id: Session identifier
            
        Returns:
            Session data or None if not found
        """
        return get_session(session_id)
    
    def update_session_data(self, session_id: str, **kwargs) -> bool:
        """
        Update session data (e.g., after form submission).
        
        Args:
            session_id: Session identifier
            **kwargs: Fields to update
            
        Returns:
            True if successful
        """
        return update_session(session_id, **kwargs)
