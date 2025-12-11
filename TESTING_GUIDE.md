# Testing Guide - Tata Capital Agentic AI

## Overview

This guide covers the test suites for the Tata Capital agentic AI system, including:
- Unit tests for agents
- Integration tests for routes
- PDF generation tests
- GitHub Actions CI/CD pipeline

## Test Files

### 1. `test_master_agent_routes.py` (210+ lines)
Integration tests for MasterAgent chat routes testing all 3 loan decision outcomes.

**Test Coverage:**
- **Approval Flow** - Happy path loan approval
  - Customer greeting → Sales engagement → KYC → Salary verification → Approval
  
- **Require Salary Flow** - Salary document requirement
  - Customer inquiry → Document collection → Salary upload → Processing
  
- **Rejection Flow** - Application rejection
  - High risk profile → KYC flags → Underwriting rejection
  
- **Common Tests**
  - Response structure validation
  - Session context maintenance
  - Session isolation
  - Error handling (empty/special characters)

**Run Tests:**
```bash
pytest backend/tests/test_master_agent_routes.py -v
```

### 2. `test_pdf_generation.py` (280+ lines)
Tests for PDF sanction letter generation and content validation.

**Test Coverage:**
- PDF file creation on request
- Content validation (customer name, loan amount)
- File persistence and retrieval
- Various loan parameters (5L, 10L, 15L)
- Custom tenure and interest rates
- Multiple concurrent requests
- EMI calculation inclusion
- Download header verification

**Run Tests:**
```bash
pytest backend/tests/test_pdf_generation.py -v
```

### 3. `test_master_agent.py` (Existing)
Unit tests for individual agents and intent classification.

### 4. `test_master_agent_enhanced.py` (Existing)
Tests for enhanced MasterAgent features (abandonment, escalation, negotiation).

## Running Tests Locally

### Quick Start
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest backend/tests/test_master_agent_routes.py

# Run specific test function
pytest backend/tests/test_master_agent_routes.py::TestMasterAgentRoutes::test_chat_sequence_approval_flow

# Run with markers
pytest -m "routes"      # API route tests
pytest -m "pdf"         # PDF generation tests
pytest -m "unit"        # Unit tests
```

### With Coverage
```bash
# Generate coverage report
pytest --cov=backend --cov-report=html --cov-report=term

# View HTML report
open htmlcov/index.html
```

## GitHub Actions CI/CD Pipeline

### Workflow File
`.github/workflows/tests.yml` - Runs on every push and pull request

### Pipeline Stages

#### 1. Test Matrix (Linux)
- Runs on: `ubuntu-latest`
- Python versions: 3.9, 3.10, 3.11
- Jobs:
  - Unit tests
  - Integration tests
  - PDF generation tests
  - Coverage reporting

#### 2. Code Quality
- Linting with `flake8`
- Type checking with `mypy`
- Code formatting with `black`
- Import sorting with `isort`
- Linting with `pylint`

#### 3. Security
- Bandit security scan
- Safety vulnerability check

#### 4. Docker Build (Optional)
- Builds Docker image
- Validates Dockerfile

### Triggering the Pipeline

**Automatic:**
- Push to `main` or `develop` branch
- Pull request to `main` or `develop`

**Manual (if configured):**
```bash
git push origin feature-branch
# GitHub Actions automatically runs tests
```

### Viewing Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. View logs and artifacts

### Test Report Artifacts
- `test-report-3.9/` - Test reports for Python 3.9
- `test-report-3.10/` - Test reports for Python 3.10
- `test-report-3.11/` - Test reports for Python 3.11

Each contains:
- `report.html` - HTML test report
- `junit.xml` - JUnit format results

## Test Configuration

### pytest.ini
```ini
[pytest]
testpaths = backend/tests
python_files = test_*.py
addopts = -v --tb=short
markers =
    unit: Unit tests
    integration: Integration tests
    routes: API route tests
    pdf: PDF generation tests
```

### conftest.py
Shared fixtures for all tests:
- `mock_session_data` - Sample session
- `mock_loan_params` - Loan parameters
- `mock_customer_profiles` - Customer scenarios
- `pdf_test_dir` - Temporary PDF directory

## Test Outcomes

### MasterAgent Routes

**Approval Flow:**
```
✓ Session created
✓ Chat messages processed
✓ Salary verified
✓ Loan approved
✓ Response contains decision
```

**Salary Requirement Flow:**
```
✓ Customer identified
✓ Salary document requested
✓ Document uploaded
✓ Salary verified
✓ Processing continues
```

**Rejection Flow:**
```
✓ Application submitted
✓ Credit assessment done
✓ Risk identified
✓ Application rejected
✓ Rejection reason provided
```

### PDF Generation

**File Creation:**
```
✓ PDF generated on request
✓ File saved in filesystem
✓ Retrievable for re-download
✓ Correct MIME type
✓ Download headers present
```

**Content Validation:**
```
✓ Contains customer name
✓ Contains loan amount
✓ Contains tenure
✓ Contains interest rate
✓ Contains EMI calculation
✓ Contains terms & conditions
```

## Common Issues

### Issue: Tests fail with import errors
**Solution:**
```bash
# Ensure backend directory is in Python path
export PYTHONPATH="${PYTHONPATH}:./backend"
pytest
```

### Issue: PDF tests fail - file not found
**Solution:**
```bash
# Create required directories
mkdir -p data/sanctions
mkdir -p uploads
```

### Issue: Async test timeouts
**Solution:**
```bash
# Add timeout to pytest call
pytest --timeout=30
```

### Issue: Database lock errors
**Solution:**
```bash
# Clean up test database
rm tatacapital_sessions.db
pytest
```

## CI/CD Troubleshooting

### Workflow not triggering
- Check branch name (should be `main` or `develop`)
- Verify `.github/workflows/tests.yml` exists
- Check GitHub Actions is enabled for repository

### Tests pass locally but fail in CI
- Verify Python version matches
- Check for environment-specific paths
- Ensure all dependencies in `requirements.txt`
- Look for file permission issues

### Coverage not uploading
- Install `codecov` integration
- Verify `CODECOV_TOKEN` is set (if needed)
- Check coverage report is generated

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Include docstring explaining scenario
3. Use fixtures for common setup
4. Mark tests appropriately (`@pytest.mark`)
5. Test both happy and sad paths
6. Keep tests focused and isolated

### Running Tests
```bash
# Before committing
pytest --cov=backend -v

# Review coverage
coverage report

# Fix any issues
black backend/
isort backend/
```

### Continuous Integration
- Tests run automatically on push
- Review GitHub Actions results
- Fix failing tests immediately
- Maintain >80% code coverage goal

## Performance Considerations

### Test Execution Time
- ~2-3 minutes for full suite
- ~30 seconds for route tests
- ~1 minute for PDF tests

### Optimizing Tests
- Run only changed tests: `pytest --lf`
- Run in parallel: `pytest -n auto`
- Skip slow tests: `pytest -m "not slow"`

## Adding New Tests

### Template for new test file:
```python
"""
Tests for [feature name].
"""
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    from app import app
    return TestClient(app)


class Test[FeatureName]:
    """Test [feature name]."""
    
    def test_[scenario](self, client):
        """Test [specific scenario]."""
        # Arrange
        
        # Act
        response = client.post("/endpoint", json={...})
        
        # Assert
        assert response.status_code == 200
```

## Resources

- **Pytest Documentation:** https://docs.pytest.org/
- **FastAPI Testing:** https://fastapi.tiangolo.com/advanced/testing-dependencies/
- **GitHub Actions:** https://docs.github.com/en/actions

## Maintenance

### Regular Tasks
- [ ] Review test coverage monthly
- [ ] Update tests for new features
- [ ] Remove deprecated tests
- [ ] Update dependencies quarterly
- [ ] Archive old test reports

### Quarterly Review
- Total test count
- Coverage percentage
- Execution time trends
- Failure rates
- Coverage gaps

## Support

For test-related questions:
1. Check existing test examples
2. Review pytest documentation
3. Run tests locally with `-vv` flag
4. Check GitHub Actions logs for CI issues

---

**Last Updated:** December 11, 2025  
**Test Framework:** pytest 7.x  
**CI/CD:** GitHub Actions  
**Status:** ✅ Production Ready
