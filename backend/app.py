# backend/app.py (improved)
import os
import uuid
import logging
from datetime import datetime, date
from typing import Optional, Dict, Any
from decimal import Decimal, ROUND_HALF_UP

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

try:
    from backend.agents import MasterAgent
    from backend.utils.pdf_helper import generate_sanction_letter
except ImportError:
    from agents import MasterAgent
    from utils.pdf_helper import generate_sanction_letter

# ---------- Configuration ----------
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
SANCTIONS_DIR = os.environ.get("SANCTIONS_DIR", "data/sanctions")
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXT = {".pdf", ".png", ".jpg", ".jpeg"}

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(SANCTIONS_DIR, exist_ok=True)

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("tata-agentic-backend")

# ---------- App & CORS ----------
app = FastAPI(
    title="Tata Capital Agentic AI - Backend",
    description="FastAPI backend for loan origination chatbot",
    version="0.1.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Pydantic models ----------
class ChatMessage(BaseModel):
    user_message: str
    session_id: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    agent: str
    timestamp: str

class UploadResponse(BaseModel):
    session_id: str
    status: str
    message: str
    stored_path: Optional[str] = None

class SanctionLetterResponse(BaseModel):
    session_id: str
    status: str
    message: str
    file_path: Optional[str] = None

class MockSalaryUploadResponse(BaseModel):
    file_id: str
    session_id: str
    status: str
    message: str
    monthly_salary: float
    annual_salary: float

# ---------- Agents & in-memory store ----------
master_agent = MasterAgent()
# lightweight in-memory sessions fallback for quick dev; prefer DB in prod
_sessions: Dict[str, Dict[str, Any]] = {}

# helper to init session (tries master_agent.init_session if exists)
def ensure_session(session_id: str) -> Dict[str, Any]:
    session = None
    # try master_agent store first
    try:
        if hasattr(master_agent, "get_session_state"):
            session = master_agent.get_session_state(session_id)
    except Exception as e:
        log.warning("master_agent.get_session_state failed: %s", e)

    if not session:
        # fall back to local store
        session = _sessions.get(session_id)
        if not session:
            log.info("Creating fallback session for %s", session_id)
            session = {
                "created_at": datetime.utcnow().isoformat(),
                "customer_name": "Applicant",
                # defaults (can be updated by agents)
                "loan_amount": 500000,
                "tenure_months": 60,
                "interest_rate": 12.5,
                "monthly_emi": None,
            }
            _sessions[session_id] = session
            # if agent supports init_session, call it
            try:
                if hasattr(master_agent, "init_session"):
                    master_agent.init_session(session_id, session)
            except Exception as e:
                log.debug("master_agent.init_session not available or failed: %s", e)
    return session

# ---------- Utilities ----------
def calculate_emi(principal: float, annual_interest_percent: float, tenure_months: int) -> float:
    """Standard EMI calculation"""
    if tenure_months <= 0:
        return 0.0
    r = float(annual_interest_percent) / 100.0 / 12.0
    P = float(principal)
    n = int(tenure_months)
    if r == 0:
        emi = P / n
    else:
        emi = P * r * (1 + r) ** n / ((1 + r) ** n - 1)
    # round to 2 decimals
    return float(Decimal(emi).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

def secure_filename(filename: str) -> str:
    # Basic sanitization — remove path parts and use uuid
    base = os.path.basename(filename)
    name, ext = os.path.splitext(base)
    ext = ext.lower()
    safe = f"{uuid.uuid4().hex}{ext}"
    return safe

# ---------- Endpoints ----------
@app.get("/")
def read_root():
    return {
        "service": "Tata Capital Agentic AI Backend",
        "version": app.version,
        "endpoints": [
            "POST /chat - Send chat message to MasterAgent",
            "POST /upload_salary - Upload salary document (query param session_id)",
            "GET /sanction/{session_id} - Download sanction letter PDF"
        ]
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(chat_msg: ChatMessage):
    session_id = chat_msg.session_id
    user_message = chat_msg.user_message
    log.info("Chat received for session=%s message=%s", session_id, user_message)

    # ensure session exists
    session = ensure_session(session_id)

    try:
        # support both sync and async master_agent.handle_message
        handler = getattr(master_agent, "handle_message", None)
        if handler is None:
            raise RuntimeError("MasterAgent has no handle_message method")

        if callable(handler):
            # call and await if coroutine
            result = handler(session_id, user_message)
            if hasattr(result, "__await__"):
                result = await result
        else:
            raise RuntimeError("handle_message is not callable")

        # Expect result to be a dict with payload/current_agent/timestamp
        payload = result.get("payload") if isinstance(result, dict) else result
        payload_str = str(payload)
        agent_name = result.get("current_agent", "MasterAgent") if isinstance(result, dict) else "MasterAgent"
        ts = result.get("timestamp", datetime.utcnow().isoformat()) if isinstance(result, dict) else datetime.utcnow().isoformat()

        return ChatResponse(
            session_id=session_id,
            response=payload_str,
            agent=agent_name,
            timestamp=ts
        )
    except Exception as e:
        log.exception("Error in chat handler for session=%s", session_id)
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")

@app.post("/upload_salary", response_model=UploadResponse)
async def upload_salary(session_id: str = Query(...), file: UploadFile = File(...)):
    """
    Upload a salary document attached to session_id.
    session_id is a required query parameter.
    """
    log.info("Upload attempt for session=%s filename=%s", session_id, getattr(file, "filename", None))
    # ensure session exists (or create fallback)
    session = ensure_session(session_id)

    # Validate extension
    original_name = file.filename or "unknown"
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {ext}. Allowed: {ALLOWED_EXT}")

    # Read first chunk to enforce max size (avoid loading huge files)
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")

    # Save file securely
    safe_name = secure_filename(original_name)
    stored_path = os.path.join(UPLOAD_DIR, f"{session_id}_salary_{safe_name}")
    try:
        with open(stored_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        log.exception("Failed to write uploaded file for session=%s", session_id)
        raise HTTPException(status_code=500, detail=f"File save failed: {e}")

    # Associate with session (try master_agent method first)
    try:
        if hasattr(master_agent, "associate_uploaded_file"):
            # optional agent hook to process the file
            maybe = master_agent.associate_uploaded_file(session_id, stored_path)
            log.debug("associate_uploaded_file returned: %s", maybe)
    except Exception as e:
        log.debug("associate_uploaded_file hook failed: %s", e)

    # update local fallback session store
    _sessions.setdefault(session_id, {}).update({"last_uploaded_salary": stored_path, "uploaded_at": datetime.utcnow().isoformat()})

    return UploadResponse(
        session_id=session_id,
        status="success",
        message=f"Salary document '{original_name}' uploaded successfully",
        stored_path=stored_path
    )

@app.post("/mock/upload_salary", response_model=MockSalaryUploadResponse)
async def mock_upload_salary(session_id: str = Query(...), file: UploadFile = File(...)):
    """
    Mock salary upload endpoint for testing.
    Accepts multipart form data and returns generated file_id with synthetic salary data.
    
    The UnderwritingAgent can use this file_id to retrieve the salary verification details.
    This endpoint returns a fixed salary amount from the synthetic dataset.
    
    Query Parameters:
        session_id: Required session identifier
        
    Request Body (multipart/form-data):
        file: Salary slip file to upload
    
    Returns:
        MockSalaryUploadResponse with file_id and salary details
    """
    log.info("Mock salary upload attempt for session=%s filename=%s", session_id, getattr(file, "filename", None))
    
    # Ensure session exists
    session = ensure_session(session_id)
    
    # Validate file extension
    original_name = file.filename or "salary_slip.pdf"
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {ext}. Allowed: {ALLOWED_EXT}")
    
    # Read file contents for validation
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 5 MB)")
    
    # Generate unique file_id for this upload
    file_id = f"{session_id}_{uuid.uuid4().hex[:8]}"
    
    # Store file with file_id
    safe_name = secure_filename(original_name)
    stored_path = os.path.join(UPLOAD_DIR, f"salary_{file_id}_{safe_name}")
    try:
        with open(stored_path, "wb") as f:
            f.write(contents)
        log.info("Salary file stored at %s", stored_path)
    except Exception as e:
        log.exception("Failed to write uploaded salary file for session=%s file_id=%s", session_id, file_id)
        raise HTTPException(status_code=500, detail=f"File save failed: {e}")
    
    # Synthetic salary data (fixed dataset for consistent testing)
    # This simulates OCR extraction from the salary slip
    synthetic_salaries = {
        "cust_001": 75000,    # Rajesh Kumar
        "cust_002": 120000,   # Priya Sharma
        "cust_003": 60000,    # Amit Patel
    }
    
    # Extract customer_id from session or use default
    customer_id = session.get('customer_id', 'cust_001')
    monthly_salary = synthetic_salaries.get(customer_id, 85000)  # Default 85K if not in mapping
    annual_salary = monthly_salary * 12
    
    # Store salary verification in session for UnderwritingAgent
    salary_check_data = {
        "file_id": file_id,
        "monthly_salary": monthly_salary,
        "annual_salary": annual_salary,
        "document_type": "salary_slip",
        "verification_date": datetime.utcnow().isoformat(),
        "stored_path": stored_path
    }
    
    # Update session with salary check data
    _sessions.setdefault(session_id, {}).update({
        "salary_check": salary_check_data,
        "salary_file_id": file_id,
        "last_salary_upload": datetime.utcnow().isoformat()
    })
    
    # Also try to update agent's session if available
    try:
        if hasattr(master_agent, "update_session_data"):
            master_agent.update_session_data(session_id, {"salary_check": salary_check_data})
    except Exception as e:
        log.debug("Could not update master_agent session with salary data: %s", e)
    
    return MockSalaryUploadResponse(
        file_id=file_id,
        session_id=session_id,
        status="success",
        message=f"Salary document verified successfully (Mock OCR)",
        monthly_salary=monthly_salary,
        annual_salary=annual_salary
    )

@app.get("/mock/salary/{file_id}")
async def get_salary_verification(file_id: str):
    """
    Retrieve salary verification details for a file_id.
    Used by UnderwritingAgent to check salary against EMI.
    
    Returns:
        Salary verification details including monthly_salary
    """
    # Search for the salary check data in all sessions
    for session_id, session_data in _sessions.items():
        salary_check = session_data.get('salary_check', {})
        if salary_check.get('file_id') == file_id:
            return {
                "status": "success",
                "file_id": file_id,
                "session_id": session_id,
                "monthly_salary": salary_check.get('monthly_salary'),
                "annual_salary": salary_check.get('annual_salary'),
                "verification_date": salary_check.get('verification_date')
            }
    
    raise HTTPException(status_code=404, detail=f"Salary verification not found for file_id: {file_id}")

@app.get("/sanction/{session_id}")
async def get_sanction_letter(session_id: str):
    """
    Retrieve or generate a sanction letter PDF for the session and return a path or stream.
    """
    log.info("Sanction request for session=%s", session_id)
    session = ensure_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Compute values (prefer session values)
    customer_name = session.get("customer_name") or "Applicant"
    loan_amount = session.get("loan_amount") or 500000
    tenure = session.get("tenure_months") or 60
    interest_rate = session.get("interest_rate") or 12.5
    
    # Ensure numeric types
    try:
        loan_amount = float(loan_amount)
        tenure = int(tenure)
        interest_rate = float(interest_rate)
    except (ValueError, TypeError):
        loan_amount = 500000
        tenure = 60
        interest_rate = 12.5

    monthly_emi = session.get("monthly_emi")
    if not monthly_emi:
        monthly_emi = calculate_emi(loan_amount, interest_rate, tenure)
        # store back
        session["monthly_emi"] = monthly_emi

    total_amount = monthly_emi * tenure
    processing_fee = float(Decimal(loan_amount * 0.01).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    pdf_path = os.path.join(SANCTIONS_DIR, f"{session_id}.pdf")

    # If file exists serve it; otherwise generate
    if not os.path.exists(pdf_path):
        try:
            result = generate_sanction_letter(
                session_id=session_id,
                name=customer_name,
                loan_amount=loan_amount,
                tenure=tenure,
                interest=interest_rate,
                emi=monthly_emi,
                total_amount=total_amount,
                processing_fee=processing_fee,
                out_dir=SANCTIONS_DIR  # optional param if your helper supports it
            )
            # generate_sanction_letter can return path string or Path, or None
            if isinstance(result, str):
                generated_pdf_path = result
            elif hasattr(result, "as_posix"):
                generated_pdf_path = str(result)
            else:
                # fallback to expected path
                generated_pdf_path = pdf_path

            if not os.path.exists(generated_pdf_path):
                log.error("generate_sanction_letter did not create path: %s", generated_pdf_path)
                raise FileNotFoundError("Sanction generator did not produce a file")
        except Exception as e:
            log.exception("Error generating sanction for session=%s", session_id)
            raise HTTPException(status_code=500, detail=f"Error generating sanction letter: {e}")
    else:
        generated_pdf_path = pdf_path

    # Return PDF file directly
    return FileResponse(generated_pdf_path, media_type="application/pdf", filename=f"{session_id}_sanction_letter.pdf")

@app.get("/sanction/{session_id}/download")
async def download_sanction(session_id: str):
    """Direct download endpoint (returns FileResponse)."""
    pdf_path = os.path.join(SANCTIONS_DIR, f"{session_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Sanction letter not found. Call /sanction/{id} to generate first.")
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"{session_id}_sanction_letter.pdf")


@app.get("/mock/customers")
def list_mock_customers():
    """
    DEV-ONLY endpoint: List all 10 synthetic test customers.
    Used by frontend DevPanel for quick customer selection in demos.
    """
    # Synthetic customer database (same structure as mock_services)
    customers_db = {
        "cust_001": {
            "customer_id": "cust_001",
            "name": "Rajesh Kumar",
            "city": "Mumbai",
            "credit_score": 785,
            "pre_approved": 750000,
        },
        "cust_002": {
            "customer_id": "cust_002",
            "name": "Priya Sharma",
            "city": "Bangalore",
            "credit_score": 820,
            "pre_approved": 1000000,
        },
        "cust_003": {
            "customer_id": "cust_003",
            "name": "Amit Patel",
            "city": "Ahmedabad",
            "credit_score": 710,
            "pre_approved": 500000,
        },
        "cust_004": {
            "customer_id": "cust_004",
            "name": "Neha Singh",
            "city": "Delhi",
            "credit_score": 750,
            "pre_approved": 600000,
        },
        "cust_005": {
            "customer_id": "cust_005",
            "name": "Vikram Desai",
            "city": "Pune",
            "credit_score": 680,
            "pre_approved": 400000,
        },
        "cust_006": {
            "customer_id": "cust_006",
            "name": "Anjali Gupta",
            "city": "Kolkata",
            "credit_score": 760,
            "pre_approved": 700000,
        },
        "cust_007": {
            "customer_id": "cust_007",
            "name": "Rohan Malhotra",
            "city": "Hyderabad",
            "credit_score": 795,
            "pre_approved": 800000,
        },
        "cust_008": {
            "customer_id": "cust_008",
            "name": "Divya Reddy",
            "city": "Chennai",
            "credit_score": 805,
            "pre_approved": 850000,
        },
        "cust_009": {
            "customer_id": "cust_009",
            "name": "Karan Verma",
            "city": "Gurgaon",
            "credit_score": 815,
            "pre_approved": 900000,
        },
        "cust_010": {
            "customer_id": "cust_010",
            "name": "Shalini Iyer",
            "city": "Kochi",
            "credit_score": 770,
            "pre_approved": 650000,
        },
    }
    
    return {
        "status": "success",
        "customer_count": len(customers_db),
        "customers": list(customers_db.values()),
    }


@app.get("/analytics")
def analytics_kpis():
    """
    Returns key performance indicators (KPIs) with demo data showing positive business impact.
    
    KPIs:
    - time_to_decision: Average time in seconds from session start to loan decision
    - conversion_rate: Percentage of sessions converted to loan approvals
    - number_of_salary_requests: Total salary verification requests in demo period
    
    Demo data demonstrates 8-10% improvement in key metrics with agentic AI.
    """
    # Demo data: Seeded KPIs showing positive business impact
    kpi_data = {
        "period": {
            "start_date": "2025-12-01",
            "end_date": "2025-12-11",
            "duration_days": 11
        },
        "performance_metrics": {
            "time_to_decision": {
                "value": 285,  # seconds (4.75 minutes)
                "unit": "seconds",
                "description": "Average time from session start to loan decision",
                "improvement_vs_baseline": 9.5,  # 9.5% improvement
                "baseline": 315,  # Traditional method: 5.25 minutes
                "improvement_minutes": 0.5
            },
            "conversion_rate": {
                "value": 68.5,  # percentage
                "unit": "%",
                "description": "Percentage of sessions converted to loan approvals",
                "improvement_vs_baseline": 8.2,  # 8.2% improvement
                "baseline": 63.2,
                "absolute_improvement_percentage_points": 5.3
            },
            "number_of_salary_requests": {
                "value": 247,  # total requests in period
                "unit": "count",
                "description": "Total salary verification requests processed",
                "success_rate": 94.7,  # % of requests successfully processed
                "avg_processing_time_seconds": 18,
                "peak_hour": "11:30 AM IST"
            }
        },
        "business_impact": {
            "projected_annual_improvement": {
                "conversion_rate_additional_approvals": 1820,  # 5.3% of ~34k annual sessions
                "time_savings_hours_per_year": 8520,  # hours saved = sessions × time_saved / 3600
                "estimated_revenue_impact": "₹18.2 Cr",  # Approvals × avg_loan_amount (500k)
                "operational_cost_savings": "₹3.4 Cr"  # Staff hours saved
            },
            "session_distribution": {
                "total_sessions": 247,
                "completed": 210,
                "abandoned": 18,
                "escalated_to_human": 19,
                "completion_rate": "85.0%"
            }
        },
        "agent_performance": {
            "MasterAgent": {
                "messages_processed": 521,
                "avg_response_time_ms": 245,
                "escalation_rate": "7.7%"  # 19/247
            },
            "SalesAgent": {
                "conversations": 156,
                "negotiation_requests": 42,
                "successful_negotiations": 38,
                "negotiation_success_rate": "90.5%"
            },
            "VerificationAgent": {
                "kyc_verifications": 210,
                "successful_verifications": 198,
                "kyc_success_rate": "94.3%",
                "avg_attempts_per_verification": 1.2
            },
            "UnderwritingAgent": {
                "loan_decisions": 210,
                "approvals": 144,
                "rejections": 66,
                "approval_rate": "68.6%"
            }
        },
        "customer_insights": {
            "avg_loan_amount_requested": 562000,
            "avg_tenure_selected": 48,
            "most_common_tenure": 60,
            "avg_interest_rate": 12.3,
            "primary_use_cases": [
                {"use_case": "Business Expansion", "percentage": 38},
                {"use_case": "Working Capital", "percentage": 32},
                {"use_case": "Equipment Purchase", "percentage": 20},
                {"use_case": "Others", "percentage": 10}
            ]
        },
        "system_health": {
            "uptime_percentage": 99.7,
            "api_response_time_p95_ms": 320,
            "error_rate": 0.3,
            "database_queries_per_session": 12,
            "avg_session_memory_mb": 2.1
        },
        "demo_note": "This data is synthetically generated to demonstrate KPI tracking capabilities. Replace with real data from session database for production use.",
        "generated_at": datetime.utcnow().isoformat(),
        "api_version": "v1"
    }
    
    return JSONResponse(
        status_code=200,
        content=kpi_data
    )


@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ---------- Run ----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
