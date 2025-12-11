"""
Unit tests for MasterAgent and worker agents.
"""
import pytest
import json
import os
import sqlite3
from datetime import datetime
from agents.master import MasterAgent, IntentClassifier
from agents.workers import SalesAgent, VerificationAgent, UnderwritingAgent, SanctionAgent
from agents.database import (
    init_database, create_session, get_session, update_session, 
    log_state_transition, DATABASE_FILE
)

@pytest.fixture(autouse=True)
def setup_teardown():
    """Setup and teardown test database."""
    # Setup: use in-memory database for tests
    if os.path.exists(DATABASE_FILE):
        os.remove(DATABASE_FILE)
    yield
    # Teardown
    if os.path.exists(DATABASE_FILE):
        os.remove(DATABASE_FILE)

class TestIntentClassifier:
    """Test intent classification logic."""
    
    def test_greeting_intent(self):
        """Test greeting intent recognition."""
        assert IntentClassifier.classify("Hello there") == "SalesAgent"
        assert IntentClassifier.classify("Hi, how are you?") == "SalesAgent"
        assert IntentClassifier.classify("Greetings") == "SalesAgent"
    
    def test_loan_inquiry_intent(self):
        """Test loan inquiry intent recognition."""
        assert IntentClassifier.classify("I need a loan") == "SalesAgent"
        assert IntentClassifier.classify("What's the interest rate?") == "SalesAgent"
        assert IntentClassifier.classify("Can you give me a quote?") == "SalesAgent"
    
    def test_verification_intent(self):
        """Test verification intent recognition."""
        assert IntentClassifier.classify("I want to verify my documents") == "VerificationAgent"
        assert IntentClassifier.classify("How do I upload my KYC?") == "VerificationAgent"
        assert IntentClassifier.classify("I have my Aadhar card ready") == "VerificationAgent"
    
    def test_default_to_current_agent(self):
        """Test default routing to current agent."""
        result = IntentClassifier.classify("Something random", "UnderwritingAgent")
        assert result == "UnderwritingAgent"

class TestDatabaseOperations:
    """Test database operations."""
    
    def test_init_database(self):
        """Test database initialization."""
        init_database()
        assert os.path.exists(DATABASE_FILE)
    
    def test_create_session(self):
        """Test session creation."""
        init_database()
        result = create_session("test_session_1", "John Doe")
        assert result is True
        
        session = get_session("test_session_1")
        assert session is not None
        assert session['customer_name'] == "John Doe"
        assert session['status'] == "active"
    
    def test_duplicate_session_creation(self):
        """Test that duplicate session creation returns False."""
        init_database()
        create_session("test_session_2", "Jane Doe")
        result = create_session("test_session_2", "John Doe")
        assert result is False
    
    def test_update_session(self):
        """Test session update."""
        init_database()
        create_session("test_session_3")
        
        update_session("test_session_3", customer_name="Alice", phone="9876543210")
        session = get_session("test_session_3")
        
        assert session['customer_name'] == "Alice"
        assert session['phone'] == "9876543210"
    
    def test_log_state_transition(self):
        """Test state transition logging."""
        init_database()
        create_session("test_session_4")
        
        log_state_transition("test_session_4", "SalesAgent", "test_action", '{"key": "value"}')
        
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM session_state WHERE session_id = ?", ("test_session_4",))
        result = cursor.fetchone()
        conn.close()
        
        assert result is not None

class TestWorkerAgents:
    """Test individual worker agent behavior - using async agents."""
    
    # Note: Worker agents have been converted to async async def handle() interface
    # See test_async_agents.py for comprehensive async worker agent tests
    
    def test_workers_use_async_interface(self):
        """Verify worker agents have async handle interface."""
        from agents.workers import SalesAgent, VerificationAgent, UnderwritingAgent, SanctionAgent
        import inspect
        
        # Check that agents have async handle method
        assert hasattr(SalesAgent, 'handle')
        assert hasattr(VerificationAgent, 'handle')
        assert hasattr(UnderwritingAgent, 'handle')
        assert hasattr(SanctionAgent, 'handle')
        
        # Verify methods are async
        assert inspect.iscoroutinefunction(SalesAgent.handle)
        assert inspect.iscoroutinefunction(VerificationAgent.handle)
        assert inspect.iscoroutinefunction(UnderwritingAgent.handle)
        assert inspect.iscoroutinefunction(SanctionAgent.handle)

class TestMasterAgent:
    """Test MasterAgent orchestration."""
    
    def test_master_agent_initialization(self):
        """Test MasterAgent initialization."""
        agent = MasterAgent()
        assert agent.agents is not None
        assert 'SalesAgent' in agent.agents
        assert 'VerificationAgent' in agent.agents
        assert 'UnderwritingAgent' in agent.agents
        assert 'SanctionAgent' in agent.agents
    
    def test_handle_message_new_session(self):
        """Test handling message for new session."""
        master = MasterAgent()
        response = master.handle_message("test_session_001", "Hello, I need a loan")
        
        assert response['session_id'] == "test_session_001"
        assert 'type' in response
        assert 'payload' in response
        assert 'timestamp' in response
        assert 'current_agent' in response
    
    def test_handle_message_existing_session(self):
        """Test handling message for existing session."""
        master = MasterAgent()
        
        # First message creates session
        response1 = master.handle_message("test_session_002", "Hello")
        assert response1['session_id'] == "test_session_002"
        
        # Second message uses existing session
        response2 = master.handle_message("test_session_002", "I want a loan")
        assert response2['session_id'] == "test_session_002"
    
    def test_agent_routing_based_on_intent(self):
        """Test routing to correct agent based on intent."""
        master = MasterAgent()
        
        # Sales inquiry should route to SalesAgent
        response = master.handle_message("test_session_003", "I'm interested in a loan")
        assert response['current_agent'] in ['SalesAgent', 'VerificationAgent']
        
        # Verification should route to VerificationAgent
        response = master.handle_message("test_session_004", "How do I upload my KYC documents?")
        assert response['current_agent'] == "VerificationAgent"
    
    def test_session_state_persistence(self):
        """Test session state is persisted correctly."""
        master = MasterAgent()
        
        # First message
        master.handle_message("test_session_005", "Hello")
        
        # Update session with customer data
        master.update_session_data("test_session_005", customer_name="John Doe", loan_amount=500000)
        
        # Retrieve and verify
        session = master.get_session_state("test_session_005")
        assert session['customer_name'] == "John Doe"
        assert session['loan_amount'] == 500000
    
    def test_response_structure(self):
        """Test response has correct structure."""
        master = MasterAgent()
        response = master.handle_message("test_session_006", "Start my application")
        
        required_keys = ['session_id', 'type', 'payload', 'timestamp', 'current_agent', 'next_agent']
        for key in required_keys:
            assert key in response, f"Missing key: {key}"
    
    def test_full_workflow(self):
        """Test complete workflow from greeting to sanction."""
        master = MasterAgent()
        session_id = "test_session_full_workflow"
        
        # Step 1: Greeting
        r1 = master.handle_message(session_id, "Hi, I need a loan")
        assert r1['current_agent'] == 'SalesAgent'
        
        # Step 2: Update with customer info
        master.update_session_data(session_id, 
                                   customer_name="Alice",
                                   phone="9876543210",
                                   email="alice@example.com",
                                   loan_amount=250000)
        
        # Step 3: Verification
        r2 = master.handle_message(session_id, "I'm ready to verify my documents")
        assert r2['current_agent'] == 'VerificationAgent'
        
        # Step 4: Underwriting
        r3 = master.handle_message(session_id, "What's the status of my application?")
        assert r3['current_agent'] == 'UnderwritingAgent'
        
        # Step 5: Sanction
        r4 = master.handle_message(session_id, "I need my sanction letter")
        assert r4['current_agent'] == 'SanctionAgent'

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
