# Tata Capital Agentic AI Chatbot

## Executive Summary

**Problem:** Tata Capital's manual loan sales process suffers from slow conversion cycles and operational bottlenecks. Traditional workflows require multiple handoffs across sales, verification, and underwriting teams, leading to extended customer wait times and reduced throughput.

**Proposed Solution:** This project delivers an intelligent **web-based chatbot** powered by a **Master Agent** orchestration framework with specialized **Worker Agents** handling distinct loan origination stages:
- **Sales Agent**: Captures customer requirements and generates loan quotes
- **Verification Agent**: Validates customer KYC and financial documents
- **Underwriting Agent**: Analyzes credit profiles and approves/declines applications
- **Sanction Agent**: Finalizes terms and generates sanction letters

The multi-agent architecture enables parallel processing, intelligent decision-making, and seamless handoffs, dramatically reducing time-to-approval while maintaining compliance and reducing manual intervention.

**Technology Stack:**
- **Frontend**: React + Vite (responsive customer interface)
- **Backend**: FastAPI (high-performance async APIs)
- **Agent Orchestration**: Custom Python orchestrator with state management
- **Database**: SQLite (lightweight, persistent data layer)
- **Document Generation**: ReportLab (PDF sanction letters)
- **Infrastructure**: Docker Compose (containerized, reproducible deployment)

**Demo Scope:** The proof-of-concept demonstrates end-to-end functionality using mock external APIs (credit bureau, CRM, offer mart) with 10 synthetic customers. The flow executes from initial chatbot inquiry through final PDF sanction letter generation, validating the complete agent pipeline.

## How to Run

### Prerequisites
- Docker and Docker Compose installed

### Quick Start
```bash
cd sin-i4-tatacapital-agentic-ai
docker-compose up --build
```

Visit `http://localhost:3000` to access the chatbot frontend. Backend API runs on `http://localhost:8000`.
