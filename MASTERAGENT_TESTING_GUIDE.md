# MasterAgent Enhancement - Quick Start & Testing Guide

## Quick Test Run

### 1. Run All Tests
```bash
cd backend/tests
python -m pytest test_master_agent_enhanced.py -v
```

### 2. Expected Output
```
test_master_agent_enhanced.py::TestMasterAgentAbandonment::test_detects_abandoned_session PASSED
test_master_agent_enhanced.py::TestMasterAgentAbandonment::test_active_session_not_abandoned PASSED
test_master_agent_enhanced.py::TestMasterAgentAbandonment::test_abandonment_flag_set_on_response PASSED
test_master_agent_enhanced.py::TestMasterAgentKYCEscalation::test_kyc_failure_increments_counter PASSED
test_master_agent_enhanced.py::TestMasterAgentKYCEscalation::test_escalation_after_threshold PASSED
test_master_agent_enhanced.py::TestMasterAgentKYCEscalation::test_escalation_response_structure PASSED
test_master_agent_enhanced.py::TestMasterAgentKYCEscalation::test_kyc_failure_response_with_remaining_attempts PASSED
test_master_agent_enhanced.py::TestMasterAgentNegotiation::test_negotiation_request_detection PASSED
test_master_agent_enhanced.py::TestMasterAgentNegotiation::test_negotiation_response_structure PASSED
test_master_agent_enhanced.py::TestMasterAgentNegotiation::test_alternate_tenure_suggestions PASSED
test_master_agent_enhanced.py::TestMasterAgentEventLogging::test_event_logging_creation PASSED
test_master_agent_enhanced.py::TestMasterAgentEventLogging::test_event_retrieval PASSED
test_master_agent_enhanced.py::TestMasterAgentEventLogging::test_event_contains_timestamp PASSED
test_master_agent_enhanced.py::TestMasterAgentEventLogging::test_event_status_tracking PASSED
test_master_agent_enhanced.py::TestMasterAgentEventLogging::test_audit_trail_completeness PASSED
test_master_agent_enhanced.py::TestMasterAgentIntegration::test_abandonment_scenario PASSED
test_master_agent_enhanced.py::TestMasterAgentIntegration::test_kyc_escalation_scenario PASSED
test_master_agent_enhanced.py::TestMasterAgentIntegration::test_negotiation_scenario PASSED

======================== 18 passed in X.XXs ========================
```

---

## Feature Testing

### Test 1: Abandonment Detection

**What it tests:** Session times out after 15 minutes of inactivity

**Test Code:**
```python
def test_detects_abandoned_session(self):
    create_session(session_id)
    
    # Mark session as 30 minutes old
    old_time = (datetime.now() - timedelta(minutes=30)).isoformat()
    update_session(session_id, updated_at=old_time)
    
    # Check if abandoned
    is_abandoned = check_abandonment(session_id, timeout_seconds=900)
    assert is_abandoned == True
```

**Expected Behavior:**
1. Session created at 20:00
2. No activity until 20:30
3. At 20:30, user tries to continue
4. System detects timeout (20:30 - 20:00 = 30 min > 15 min limit)
5. Returns `session_expired` error
6. Event logged: `abandonment`

**Frontend Shows:**
```
❌ Session Expired
Please refresh and start a new application
```

---

### Test 2: KYC Escalation

**What it tests:** System escalates to human after 3 failed KYC attempts

**Test Code:**
```python
def test_escalation_after_threshold(self):
    create_session(session_id)
    
    # Simulate 3 failed KYC attempts
    for i in range(3):
        increment_kyc_failures(session_id)
    
    # Escalate
    escalate_session(session_id, 'kyc_failures', 'Multiple failures')
    
    # Verify
    escalations = get_escalations(session_id)
    assert len(escalations) == 1
    assert escalations[0]['reason'] == 'kyc_failures'
```

**Expected Behavior:**

```
User KYC Attempt 1 (Invalid PAN)
  ├─ kyc_failures = 1
  ├─ Event logged: kyc_failure
  └─ Message: "2 attempts remaining"

User KYC Attempt 2 (Invalid Aadhar)
  ├─ kyc_failures = 2
  ├─ Event logged: kyc_failure
  └─ Message: "1 attempt remaining"

User KYC Attempt 3 (Invalid Date)
  ├─ kyc_failures = 3
  ├─ THRESHOLD EXCEEDED!
  ├─ Event logged: escalation
  ├─ Escalation record created
  └─ Message: "Escalated to support team"
```

**Frontend Shows:**
```
🔴 Case Escalated
Your case has been escalated to our support team.
A representative will contact you within 2 hours.
```

**Database State:**
```sql
-- sessions table
session_id    | kyc_failures | escalated_to_human | status
abc123        | 3            | 1                  | escalated

-- escalations table
id | session_id | reason       | escalated_at
1  | abc123     | kyc_failures | 2025-12-11 20:15:30
```

---

### Test 3: Offer Negotiation

**What it tests:** User can request EMI negotiation and get alternate options

**Test Code:**
```python
def test_negotiation_request_detection(self):
    # These should trigger negotiation
    assert _is_negotiation_request("Can I get a lower EMI?") == True
    assert _is_negotiation_request("Is there a cheaper option?") == True
    
    # These should NOT trigger negotiation
    assert _is_negotiation_request("What is the interest rate?") == False
```

**Expected Behavior:**

```
User: "Can I get a lower EMI?"
  ↓
System detects keywords: ['lower', 'emi']
  ↓
Event logged: negotiation_request
  ↓
SalesAgent generates 3 options:
  1. 24 months:  ₹22,000/month  → Lower total interest
  2. 36 months:  ₹16,500/month  → Balanced payment
  3. 60 months:  ₹10,000/month  → Lowest monthly EMI
  ↓
Event logged: negotiation_response
  ↓
User selects one option
  ↓
Flow continues with new tenure
```

**Negotiation Keywords Detected:**
- emi, lower, reduce, cheaper
- negotiate, payment, monthly
- cheaper option, lower rate, alternate, different tenure

**Response Structure:**
```json
{
  "type": "action",
  "payload": {
    "message": "I can help you find a better EMI option!",
    "action_type": "negotiate_offer",
    "suggestions": [
      {
        "tenure": 24,
        "estimated_emi": 22000,
        "benefit": "Lower total interest"
      },
      {
        "tenure": 36,
        "estimated_emi": 16500,
        "benefit": "Balanced EMI"
      },
      {
        "tenure": 60,
        "estimated_emi": 10000,
        "benefit": "Lower monthly payment"
      }
    ]
  }
}
```

---

### Test 4: Event Logging

**What it tests:** All session events are logged for audit trail

**Test Code:**
```python
def test_event_logging_creation(self):
    create_session(session_id)
    
    event_id = log_event(
        session_id,
        'message_received',
        'SalesAgent',
        'User sent message',
        'Hello, I need a loan'
    )
    assert event_id > 0
```

**Expected Behavior:**

**Event Types Logged:**
- `message_received` - User sent message to agent
- `message_processed` - Agent processed and responded
- `kyc_failure` - KYC verification failed
- `escalation` - Session escalated to human
- `negotiation_request` - User requested EMI negotiation
- `negotiation_response` - Agent provided options
- `abandonment` - Session timeout detected

**Audit Trail Query:**
```sql
SELECT * FROM session_events 
WHERE session_id = 'abc123'
ORDER BY timestamp DESC;

id | session_id | event_type | agent_name | message_text | user_input | status | timestamp
-- | ---------- | ---------- | ---------- | ------------ | ---------- | ------ | ---------
5  | abc123 | escalation | MasterAgent | Escalated due to failures | NULL | error | 2025-12-11 20:15:30
4  | abc123 | kyc_failure | VerificationAgent | KYC failed attempt 3 | kyc_data_3 | warning | 2025-12-11 20:15:20
3  | abc123 | kyc_failure | VerificationAgent | KYC failed attempt 2 | kyc_data_2 | warning | 2025-12-11 20:15:10
2  | abc123 | message_processed | SalesAgent | Form submitted | form_data | normal | 2025-12-11 20:14:50
1  | abc123 | message_received | SalesAgent | Session started | START_SESSION | normal | 2025-12-11 20:14:40
```

---

## Integration Scenario Testing

### Complete User Journey Test

**Scenario: User KYC Fails 3 Times, Gets Escalated**

```bash
python -m pytest test_master_agent_enhanced.py::TestMasterAgentIntegration::test_kyc_escalation_scenario -v
```

**Expected Flow:**
```
1. Session created
2. User fills loan form
   ✓ Event: message_processed
3. User enters KYC data (attempt 1)
   ✓ Event: kyc_failure (kyc_failures = 1)
   ✓ Message: "2 attempts remaining"
4. User enters KYC data (attempt 2)
   ✓ Event: kyc_failure (kyc_failures = 2)
   ✓ Message: "1 attempt remaining"
5. User enters KYC data (attempt 3)
   ✓ Event: kyc_failure (kyc_failures = 3)
   ✓ THRESHOLD MET!
   ✓ Event: escalation
   ✓ Escalation record created
   ✓ Status: escalated
   ✓ escalated_to_human: 1
   ✓ Message: "Escalated to support team"
```

**Database Verification:**
```python
# After test
session = get_session(session_id)
assert session['kyc_failures'] == 3
assert session['escalated_to_human'] == 1
assert session['status'] == 'escalated'

escalations = get_escalations(session_id)
assert len(escalations) == 1
assert escalations[0]['reason'] == 'kyc_failures'

events = get_session_events(session_id)
assert any(e['event_type'] == 'escalation' for e in events)
```

---

## Manual Testing (Without Pytest)

### Test Abandonment Manually
```python
from agents.master import MasterAgent
from agents.database import create_session, check_abandonment
from datetime import datetime, timedelta
import sqlite3

agent = MasterAgent()
session_id = "manual_test_1"

# Create session
create_session(session_id)

# Manually mark as old
conn = sqlite3.connect('tatacapital_sessions.db')
cursor = conn.cursor()
old_time = (datetime.now() - timedelta(minutes=20)).isoformat()
cursor.execute('UPDATE sessions SET updated_at = ? WHERE session_id = ?',
               (old_time, session_id))
conn.commit()
conn.close()

# Check abandonment
is_abandoned = check_abandonment(session_id)
print(f"Is abandoned: {is_abandoned}")  # Should print: True

# Get response
response = agent._create_abandonment_response(session_id)
print(f"Response: {response['payload']['message']}")
```

### Test Negotiation Manually
```python
from agents.master import MasterAgent

agent = MasterAgent()

# Test detection
messages = [
    "Can I get a lower EMI?",
    "Is there a cheaper option?",
    "What's the interest rate?"  # Should NOT trigger
]

for msg in messages:
    is_negotiation = agent._is_negotiation_request(msg)
    print(f"'{msg}' → {is_negotiation}")
```

### Test Event Logging Manually
```python
from agents.database import (
    init_database, create_session, log_event, get_session_events
)

init_database()
session_id = "manual_test_2"
create_session(session_id)

# Log events
log_event(session_id, 'message_received', 'SalesAgent', 'Test message 1')
log_event(session_id, 'kyc_failure', 'VerificationAgent', 'Test message 2')
log_event(session_id, 'escalation', 'MasterAgent', 'Test message 3')

# Retrieve events
events = get_session_events(session_id)
print(f"Total events: {len(events)}")  # Should print: 3

# Filter by type
kyc_events = get_session_events(session_id, 'kyc_failure')
print(f"KYC events: {len(kyc_events)}")  # Should print: 1
```

---

## Configuration Customization

### Change Abandonment Timeout (5 minutes instead of 15)
```python
from agents.master import MasterAgent

agent = MasterAgent()
agent.abandonment_timeout = 300  # 5 minutes in seconds

# Now sessions timeout after 5 minutes
```

### Change KYC Escalation Threshold (5 failures instead of 3)
```python
from agents.master import MasterAgent

agent = MasterAgent()
agent.kyc_escalation_threshold = 5

# Now escalate after 5 KYC failures instead of 3
```

### Add Custom Negotiation Keywords
```python
# Edit master.py _is_negotiation_request() method
negotiation_keywords = [
    'emi', 'lower', 'reduce', 'cheaper',
    'negotiate', 'payment', 'monthly',
    'YOUR_NEW_KEYWORD_1',  # Add here
    'YOUR_NEW_KEYWORD_2'   # Add here
]
```

---

## Debugging Tips

### Check Database State
```python
import sqlite3

conn = sqlite3.connect('tatacapital_sessions.db')
cursor = conn.cursor()

# Check sessions
cursor.execute('SELECT session_id, kyc_failures, escalated_to_human, status FROM sessions')
print("Sessions:", cursor.fetchall())

# Check events
cursor.execute('SELECT event_type, status, timestamp FROM session_events ORDER BY timestamp DESC LIMIT 10')
print("Recent events:", cursor.fetchall())

# Check escalations
cursor.execute('SELECT session_id, reason, escalated_at FROM escalations')
print("Escalations:", cursor.fetchall())

conn.close()
```

### Verbose Logging
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('agents.master')

# Now all debug messages will be printed
response = agent.handle_message(session_id, "Test message")
```

### Check Test Coverage
```bash
cd backend/tests
python -m pytest test_master_agent_enhanced.py --cov=agents --cov-report=html

# Opens coverage report in htmlcov/index.html
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail with "DB locked" | Delete `tatacapital_sessions.db` and rerun |
| Import errors | Ensure backend is in Python path: `sys.path.insert(0, 'backend')` |
| Abandonment not detected | Check `updated_at` timestamp in database |
| Events not logged | Verify `session_events` table exists: `python -c "from agents.database import init_database; init_database()"` |
| Negotiation not triggering | Check keywords list in `_is_negotiation_request()` |

---

## Next Steps

1. ✅ Run all tests: `pytest test_master_agent_enhanced.py -v`
2. ✅ Review test output for any failures
3. ✅ Check database schema: `sqlite3 tatacapital_sessions.db ".tables"`
4. ✅ Integrate with FastAPI app.py for production use
5. ✅ Add monitoring dashboard for escalations
6. ✅ Deploy to staging environment

---

## Production Deployment Checklist

- [ ] All tests passing
- [ ] Database backups in place
- [ ] Escalation notification system set up
- [ ] Support team trained on escalation workflow
- [ ] Monitoring alerts configured
- [ ] Audit trail accessible to compliance team
- [ ] Load testing completed
- [ ] Documentation reviewed with team

