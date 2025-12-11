"""
Quick Demo: Mock Services API
Run this after starting the mock services server on port 9000
"""

import time
import subprocess
import sys
from pathlib import Path


def start_mock_services():
    """Start the mock services server."""
    print("\n" + "="*80)
    print("STARTING MOCK SERVICES SERVER")
    print("="*80 + "\n")
    
    app_path = Path(__file__).parent / "prototypes" / "mock_services" / "app.py"
    
    proc = subprocess.Popen(
        [sys.executable, str(app_path)],
        cwd=str(Path(__file__).parent),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    print("Waiting for server to start...")
    time.sleep(3)
    
    return proc


def run_integration_examples():
    """Run integration guide examples."""
    print("\n" + "="*80)
    print("RUNNING INTEGRATION EXAMPLES")
    print("="*80 + "\n")
    
    import requests
    from integration_guide import (
        example_1_complete_customer_profile,
        example_2_loan_eligibility_check,
        example_3_emi_calculations,
        example_4_batch_customer_processing,
        example_5_advanced_eligibility_matrix,
        example_6_dynamic_offer_recommendation,
    )
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:9000/health", timeout=2)
        if response.status_code != 200:
            raise Exception("Server not responding correctly")
    except:
        print("❌ Mock Services server not responding on port 9000")
        print("Make sure to start the server first:")
        print("  python prototypes/mock_services/app.py")
        return False
    
    print("✅ Mock Services server is running!\n")
    
    try:
        example_1_complete_customer_profile()
        example_2_loan_eligibility_check()
        example_3_emi_calculations()
        example_4_batch_customer_processing()
        example_5_advanced_eligibility_matrix()
        example_6_dynamic_offer_recommendation()
        return True
    except Exception as e:
        print(f"\n❌ Error running examples: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main demo runner."""
    print("\n" + "="*80)
    print("TATA CAPITAL - MOCK SERVICES API DEMO")
    print("="*80)
    
    # Try to start server
    server_proc = None
    try:
        server_proc = start_mock_services()
        print("✅ Server started (PID: {})".format(server_proc.pid))
    except Exception as e:
        print(f"⚠️  Could not auto-start server: {e}")
        print("\nPlease start the mock services manually:")
        print("  cd prototypes/mock_services")
        print("  python app.py")
        print("\nThen run this script again.")
        return
    
    try:
        # Run examples
        success = run_integration_examples()
        
        if success:
            print("\n" + "="*80)
            print("✅ DEMO COMPLETED SUCCESSFULLY")
            print("="*80)
            print("\nMock Services is now running on http://localhost:9000")
            print("\nNext Steps:")
            print("  1. Read MOCK_SERVICES_README.md for full API documentation")
            print("  2. Run: python test_mock_services.py (comprehensive tests)")
            print("  3. Integrate with main backend using MockServicesClient")
            print("  4. Interactive docs: http://localhost:9000/docs")
            print("\n" + "="*80 + "\n")
        
    finally:
        # Cleanup
        if server_proc:
            print("\nShutting down server...")
            server_proc.terminate()
            try:
                server_proc.wait(timeout=5)
            except:
                server_proc.kill()
            print("✅ Server stopped")


if __name__ == "__main__":
    main()
