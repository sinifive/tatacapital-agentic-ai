#!/usr/bin/env python3
"""
Integration test for the /sanction/{session_id} endpoint.
Tests both PDF generation and HTTP endpoint serving.
"""

import os
import sys
import asyncio
import json
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from backend.app import app


def test_sanction_endpoint():
    """Test the GET /sanction/{session_id} endpoint."""
    print("\n" + "="*80)
    print("TEST: GET /sanction/{session_id} Endpoint")
    print("="*80)
    
    client = TestClient(app)
    
    # Test 1: Request non-existent session (should fail gracefully)
    print("\n1️⃣  Testing non-existent session...")
    response = client.get("/sanction/nonexistent_session")
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 404:
        print(f"   ✅ Correctly returned 404: {response.json()['detail']}")
    else:
        print(f"   Response: {response.text[:100]}")
    
    # Test 2: Generate and serve PDF
    print("\n2️⃣  Testing PDF generation and serving...")
    
    # First, use the /chat endpoint to create a session
    chat_payload = {
        "user_message": "I want a personal loan of 500000 rupees",
        "session_id": "integration_test_001"
    }
    
    chat_response = client.post("/chat", json=chat_payload)
    print(f"   Chat response status: {chat_response.status_code}")
    
    if chat_response.status_code == 200:
        print(f"   ✅ Session created: integration_test_001")
        
        # Now request the sanction letter
        sanction_response = client.get("/sanction/integration_test_001")
        print(f"\n   Sanction endpoint status: {sanction_response.status_code}")
        
        if sanction_response.status_code == 200:
            print(f"   ✅ PDF served successfully!")
            print(f"   Content-Type: {sanction_response.headers.get('content-type')}")
            print(f"   Content-Length: {len(sanction_response.content)} bytes")
            print(f"   File Size: {len(sanction_response.content)/1024:.2f} KB")
            
            # Verify it's a valid PDF
            if sanction_response.content.startswith(b'%PDF'):
                print(f"   ✅ Content is valid PDF (starts with %PDF)")
            else:
                print(f"   ⚠️  Warning: Content may not be valid PDF")
        else:
            print(f"   ❌ Failed to get PDF: {sanction_response.status_code}")
            print(f"   Response: {sanction_response.text}")
    else:
        print(f"   ❌ Failed to create session: {chat_response.status_code}")


def test_root_endpoint():
    """Test the root endpoint shows sanction endpoint."""
    print("\n" + "="*80)
    print("TEST: Root Endpoint Documentation")
    print("="*80)
    
    client = TestClient(app)
    response = client.get("/")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ Root endpoint working")
        print(f"Service: {data.get('service')}")
        print(f"Version: {data.get('version')}")
        print(f"\nAvailable endpoints:")
        for endpoint in data.get('endpoints', []):
            print(f"  - {endpoint}")
            if 'sanction' in endpoint.lower():
                print(f"    ✅ Sanction endpoint documented")
    else:
        print(f"❌ Root endpoint returned {response.status_code}")


def test_health_endpoint():
    """Test health check endpoint."""
    print("\n" + "="*80)
    print("TEST: Health Check Endpoint")
    print("="*80)
    
    client = TestClient(app)
    response = client.get("/health")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Health check passed")
        print(f"   Status: {data.get('status')}")
        print(f"   Timestamp: {data.get('timestamp')}")
    else:
        print(f"❌ Health check failed: {response.status_code}")


def test_pdf_files_generated():
    """Verify PDF files exist in data/sanctions directory."""
    print("\n" + "="*80)
    print("TEST: PDF Files in data/sanctions Directory")
    print("="*80)
    
    sanctions_dir = Path("data/sanctions")
    if sanctions_dir.exists():
        pdf_files = list(sanctions_dir.glob("*.pdf"))
        print(f"\n✅ Directory exists: {sanctions_dir}")
        print(f"Found {len(pdf_files)} PDF files:")
        
        total_size = 0
        for pdf_file in sorted(pdf_files):
            size = pdf_file.stat().st_size
            total_size += size
            print(f"   ✅ {pdf_file.name:<40} {size:>8} bytes ({size/1024:.2f} KB)")
        
        print(f"\n📊 Total: {len(pdf_files)} files, {total_size/1024:.2f} KB")
        return len(pdf_files) > 0
    else:
        print(f"❌ Directory not found: {sanctions_dir}")
        return False


def test_download_pdf():
    """Test actual PDF download."""
    print("\n" + "="*80)
    print("TEST: PDF Download and File Save")
    print("="*80)
    
    client = TestClient(app)
    session_id = "download_test_session"
    
    # Request PDF
    response = client.get(f"/sanction/{session_id}")
    
    if response.status_code == 200:
        # Try to save to file
        download_path = f"temp_{session_id}_download.pdf"
        with open(download_path, 'wb') as f:
            f.write(response.content)
        
        if os.path.exists(download_path):
            file_size = os.path.getsize(download_path)
            print(f"✅ PDF downloaded and saved successfully")
            print(f"   Path: {download_path}")
            print(f"   Size: {file_size} bytes ({file_size/1024:.2f} KB)")
            print(f"   Valid PDF: {response.content.startswith(b'%PDF')}")
            
            # Clean up
            os.remove(download_path)
            print(f"   ✅ Temp file cleaned up")
        else:
            print(f"❌ Failed to save PDF to {download_path}")
    else:
        print(f"❌ Failed to download PDF: {response.status_code}")


def main():
    """Run all integration tests."""
    print("\n" + "╔" + "="*78 + "╗")
    print("║" + " "*15 + "PDF SANCTION LETTER ENDPOINT INTEGRATION TESTS" + " "*17 + "║")
    print("╚" + "="*78 + "╝")
    
    try:
        test_root_endpoint()
        test_health_endpoint()
        test_pdf_files_generated()
        test_download_pdf()
        test_sanction_endpoint()
        
        print("\n" + "="*80)
        print("✅ INTEGRATION TESTS COMPLETE")
        print("="*80)
        
        print("\n🎯 Next Steps:")
        print("   1. Run the FastAPI server:")
        print("      python -m uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000")
        print("\n   2. Access the endpoints:")
        print("      GET  http://localhost:8000/")
        print("      GET  http://localhost:8000/health")
        print("      POST http://localhost:8000/chat")
        print("      GET  http://localhost:8000/sanction/{session_id}")
        print("\n   3. Test with curl:")
        print('      curl http://localhost:8000/sanction/test_session_001 -o sanction.pdf')
        
        return 0
    
    except Exception as e:
        print(f"\n❌ Test error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
