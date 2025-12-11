# Agent Orchestration System

This directory contains the multi-agent orchestration system for Tata Capital's loan origination chatbot.

## Architecture

### MasterAgent
**File:** `master.py`

The `MasterAgent` class orchestrates the entire workflow by:
- Creating and managing session state in SQLite
- Classifying user message intents
- Routing messages to appropriate worker agents
- Maintaining conversation flow across multiple stages
- Returning structured responses for frontend rendering

**Key Methods:**
- `handle_message(session_id, message)` - Main orchestration method
- `get_session_state(session_id)` - Retrieve session data
- `update_session_data(session_id, **kwargs)` - Update session fields

### IntentClassifier
**File:** `master.py`

Simple rule-based intent classifier that recognizes keywords and routes to appropriate agents:
- **Greeting** → SalesAgent
- **Loan Inquiry** → SalesAgent
- **Verification/KYC** → VerificationAgent
- **Approval Status** → UnderwritingAgent
- **Sanction/Letter** → SanctionAgent

### Worker Agents

#### SalesAgent (`workers.py`)
Handles initial customer inquiry and collects loan requirements:
- Greets customers
- Captures customer information (name, phone, email, loan amount)
- Generates loan quotes (mock)
- Routes to VerificationAgent

#### VerificationAgent (`workers.py`)
Manages KYC and document verification:
- Requests required documents (Aadhar, salary certificate, address proof)
- Simulates KYC verification
- Routes to UnderwritingAgent upon completion

#### UnderwritingAgent (`workers.py`)
Evaluates loan eligibility and makes approval decisions:
- Calculates EMI based on loan amount
- Applies business logic for interest rates
- Returns approval decision with loan terms
- Routes to SanctionAgent if approved

#### SanctionAgent (`workers.py`)
Finalizes the loan and generates sanction letter:
- Confirms final terms
- Triggers PDF generation via ReportLab
- Provides download link for sanction letter

## Database Schema

### sessions
Stores session and customer data:
```sql
session_id (TEXT, PRIMARY KEY)
customer_name (TEXT)
phone (TEXT)
email (TEXT)
loan_amount (REAL)
current_agent (TEXT)
status (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### session_state
Audit log for all agent transitions:
```sql
id (INTEGER, PRIMARY KEY)
session_id (TEXT, FOREIGN KEY)
agent_name (TEXT)
action (TEXT)
data (TEXT) -- JSON payload
timestamp (TIMESTAMP)
```

### documents
Tracks uploaded documents:
```sql
id (INTEGER, PRIMARY KEY)
session_id (TEXT, FOREIGN KEY)
doc_type (TEXT)
file_path (TEXT)
uploaded_at (TIMESTAMP)
```

## Response Format

All agent responses follow a structured format for frontend consumption:

```python
{
    "type": "text" | "form" | "action",
    "payload": {...},           # Agent-specific data
    "next_agent": "AgentName",  # Next agent in pipeline
    "session_id": "session_123",
    "timestamp": "2025-12-11T...",
    "current_agent": "AgentName"
}
```

### Response Types

**text**: Simple message response
```json
{
    "type": "text",
    "payload": {
        "message": "Welcome to Tata Capital..."
    }
}
```

**form**: Request customer input via form
```json
{
    "type": "form",
    "payload": {
        "title": "Customer Information",
        "fields": [
            {"name": "full_name", "type": "text", "label": "Full Name"}
        ]
    }
}
```

**action**: Trigger frontend action (file upload, PDF download, etc.)
```json
{
    "type": "action",
    "payload": {
        "message": "...",
        "action_type": "file_upload" | "generate_pdf",
        "download_link": "/sanction/{session_id}"
    }
}
```

## Usage

### Initialize MasterAgent
```python
from agents import MasterAgent

master = MasterAgent()
```

### Process User Message
```python
response = master.handle_message("session_123", "Hi, I need a loan")
# Returns structured response with current_agent, type, payload, etc.
```

### Update Session Data
```python
master.update_session_data("session_123", 
                          customer_name="John Doe",
                          phone="9876543210",
                          loan_amount=500000)
```

### Retrieve Session State
```python
session = master.get_session_state("session_123")
print(session['customer_name'])
print(session['current_agent'])
```

## Testing

Comprehensive unit tests are in `tests/test_master_agent.py`:

```bash
# Run all tests
pytest tests/test_master_agent.py -v

# Run specific test class
pytest tests/test_master_agent.py::TestMasterAgent -v

# Run with coverage
pytest tests/test_master_agent.py --cov=agents --cov-report=html
```

### Test Coverage
- IntentClassifier routing logic
- Database CRUD operations
- Individual worker agent behavior
- MasterAgent orchestration
- Full end-to-end workflow

## Future Enhancements

1. **LLM Integration**: Replace rule-based intent classifier with actual LLM
2. **Advanced Credit Scoring**: Integrate real credit bureau APIs
3. **Document OCR**: Extract data from uploaded documents
4. **Multi-language Support**: Support regional languages
5. **Audit Logging**: Enhanced logging to Elasticsearch or similar
6. **Distributed State**: Move to Redis for multi-instance deployments
7. **Custom Business Rules Engine**: Pluggable rules for different loan products
