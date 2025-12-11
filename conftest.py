"""
Pytest configuration and shared fixtures for all tests.
"""
import pytest
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))


@pytest.fixture(scope="session")
def test_session():
    """Setup test session."""
    print("\n🧪 Starting test session")
    yield
    print("\n✅ Test session completed")


@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Cleanup test files after each test."""
    yield
    # Cleanup logic here if needed
    test_dirs = ["uploads", "data/sanctions", "test_data"]
    for test_dir in test_dirs:
        if os.path.exists(test_dir):
            # Don't delete, just clean old test files
            pass


@pytest.fixture
def mock_session_data():
    """Provide mock session data for tests."""
    return {
        "session_id": "test_session_123",
        "customer_name": "Rajesh Kumar",
        "phone": "9876543210",
        "email": "rajesh@example.com",
        "loan_amount": 750000,
        "tenure_months": 60,
        "interest_rate": 12.5,
        "monthly_emi": 15500,
    }


@pytest.fixture
def mock_loan_params():
    """Provide mock loan parameters."""
    return {
        "loan_amounts": [500000, 750000, 1000000, 1500000],
        "tenures": [24, 36, 48, 60, 84],
        "interest_rates": [11.0, 12.0, 12.5, 13.0, 14.0],
    }


@pytest.fixture
def mock_customer_profiles():
    """Provide mock customer profiles for different scenarios."""
    return {
        "approval_profile": {
            "name": "Priya Sharma",
            "phone": "9123456789",
            "email": "priya@example.com",
            "loan_amount": 800000,
            "salary": 150000,
            "credit_score": 820,
            "kyc_status": "verified",
        },
        "require_salary_profile": {
            "name": "Amit Patel",
            "phone": "9111111111",
            "email": "amit@example.com",
            "loan_amount": 600000,
            "salary": 75000,
            "credit_score": 750,
            "kyc_status": "pending",
        },
        "rejection_profile": {
            "name": "Vikas Singh",
            "phone": "9222222222",
            "email": "vikas@example.com",
            "loan_amount": 2000000,
            "salary": 30000,
            "credit_score": 580,
            "kyc_status": "failed",
        },
    }


@pytest.fixture
def pdf_test_dir():
    """Create temporary directory for PDF tests."""
    import tempfile
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


# Markers for test categorization
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "unit: Unit tests"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests"
    )
    config.addinivalue_line(
        "markers", "routes: API route tests"
    )
    config.addinivalue_line(
        "markers", "pdf: PDF generation tests"
    )
    config.addinivalue_line(
        "markers", "slow: Slow running tests"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on test names."""
    for item in items:
        # Add markers based on test file/function names
        if "route" in item.nodeid:
            item.add_marker(pytest.mark.routes)
        if "pdf" in item.nodeid:
            item.add_marker(pytest.mark.pdf)
        if "test_" in item.nodeid and "test_master_agent" in item.nodeid:
            item.add_marker(pytest.mark.unit)
