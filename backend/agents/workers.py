"""
Async worker agents for specialized tasks in loan origination workflow.
"""
import json
import random
import os
from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from .mock_apis import MockOfferMart, MockCRM, MockCreditBureau, MockDocumentVerification

SANCTION_LETTERS_DIR = "sanction_letters"

class WorkerAgent(ABC):
    """
    Abstract base class for all async worker agents.
    """
    
    def __init__(self, name: str):
        """
        Initialize worker agent.
        
        Args:
            name: Agent name (e.g., 'SalesAgent')
        """
        self.name = name
    
    @abstractmethod
    async def handle(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process context asynchronously and return structured response.
        
        Args:
            context: Conversation context with session and customer data
            
        Returns:
            Dictionary with keys: type, payload, next_agent, ui_actions
        """
        pass

class SalesAgent(WorkerAgent):
    """
    Sales Agent: Handles initial inquiry, collects loan requirements, and generates offers.
    
    Collects:
    - Loan amount
    - Desired tenure
    - Purpose/intent
    
    Returns offer suggestions from mock offer-mart API.
    """
    
    def __init__(self):
        super().__init__("SalesAgent")
    
    async def handle(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process sales inquiry and collect loan requirements.
        """
        session_data = context.get('session_data', {})
        user_message = context.get('user_message', '')
        
        # Check if customer provided loan details
        if 'loan_amount' in context and 'tenure' in context:
            loan_amount = context['loan_amount']
            tenure = context['tenure']
            
            # Fetch offers from mock offer-mart
            offers = await MockOfferMart.get_offers(loan_amount, tenure)
            
            return {
                "type": "action",
                "payload": {
                    "message": f"Great! Based on your requirement of ₹{loan_amount:,.0f} for {tenure} months, here are our best offers:",
                    "offers": offers.get('offers', []),
                    "action_type": "display_offers"
                },
                "next_agent": "VerificationAgent",
                "ui_actions": [
                    {
                        "action": "show_offer_cards",
                        "offers": offers.get('offers', [])
                    },
                    {
                        "action": "proceed_button",
                        "label": "Select Offer & Continue",
                        "next_step": "verification"
                    }
                ]
            }
        
        # Request loan details if not provided
        return {
            "type": "form",
            "payload": {
                "title": "Loan Requirements",
                "message": "Please provide your loan requirements:",
                "fields": [
                    {
                        "name": "loan_amount",
                        "type": "number",
                        "label": "Loan Amount (₹)",
                        "placeholder": "100000",
                        "required": True
                    },
                    {
                        "name": "tenure",
                        "type": "select",
                        "label": "Desired Tenure (months)",
                        "options": [12, 24, 36, 48, 60],
                        "required": True
                    },
                    {
                        "name": "purpose",
                        "type": "select",
                        "label": "Loan Purpose",
                        "options": ["Personal Use", "Business", "Home Improvement", "Education"],
                        "required": True
                    }
                ]
            },
            "next_agent": "SalesAgent",
            "ui_actions": [
                {
                    "action": "show_form",
                    "form_type": "loan_requirements"
                }
            ]
        }

class VerificationAgent(WorkerAgent):
    """
    Verification Agent: Handles KYC verification and document checks.
    
    Calls mock CRM to verify:
    - Customer name
    - Phone number
    - Address
    
    Requests supporting documents for verification.
    """
    
    def __init__(self):
        super().__init__("VerificationAgent")
    
    async def handle(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify customer KYC against CRM and request documents.
        """
        session_data = context.get('session_data', {})
        customer_id = context.get('customer_id') or session_data.get('customer_id')
        phone = context.get('phone') or session_data.get('phone')
        
        if customer_id:
            # Verify customer in CRM
            crm_result = await MockCRM.verify_customer(customer_id, phone)
            
            if crm_result['status'] == 'verified':
                kyc_fields = crm_result.get('kyc_fields', {})
                
                return {
                    "type": "action",
                    "payload": {
                        "message": f"Hello {kyc_fields.get('name', 'Customer')}! Your identity has been verified.",
                        "kyc_data": kyc_fields,
                        "action_type": "request_documents"
                    },
                    "next_agent": "VerificationAgent",
                    "ui_actions": [
                        {
                            "action": "show_verification_status",
                            "status": "verified",
                            "kyc_data": {
                                "name": kyc_fields.get('name'),
                                "phone": kyc_fields.get('phone'),
                                "address": kyc_fields.get('address')
                            }
                        },
                        {
                            "action": "request_file_upload",
                            "document_type": "salary_slip",
                            "label": "Upload Salary Certificate/Slip",
                            "accept": ".pdf,.jpg,.png"
                        }
                    ]
                }
        
        # Request customer identification if not yet verified
        return {
            "type": "form",
            "payload": {
                "title": "KYC Verification",
                "message": "Please provide your details for verification:",
                "fields": [
                    {
                        "name": "customer_id",
                        "type": "text",
                        "label": "Customer ID (if available)",
                        "required": False
                    },
                    {
                        "name": "phone",
                        "type": "tel",
                        "label": "Phone Number",
                        "required": True
                    },
                    {
                        "name": "full_name",
                        "type": "text",
                        "label": "Full Name",
                        "required": True
                    }
                ]
            },
            "next_agent": "VerificationAgent",
            "ui_actions": [
                {
                    "action": "show_form",
                    "form_type": "kyc_details"
                }
            ]
        }

class UnderwritingAgent(WorkerAgent):
    """
    Underwriting Agent: Evaluates creditworthiness and makes decisions.
    
    Business Rules:
    1. Calls mock credit bureau to get credit_score and pre_approved amount
    2. If loan_amount ≤ pre_approved: Auto-approve
    3. If loan_amount ≤ 2 × pre_approved: Request salary slip
       - Approve if EMI ≤ 50% of monthly salary
       - Reject otherwise
    4. If loan_amount > 2 × pre_approved: Reject
    """
    
    def __init__(self):
        super().__init__("UnderwritingAgent")
    
    async def handle(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate loan eligibility using credit bureau and underwriting rules.
        """
        session_data = context.get('session_data', {})
        customer_id = context.get('customer_id') or session_data.get('customer_id')
        loan_amount = context.get('loan_amount') or session_data.get('loan_amount')
        tenure_months = context.get('tenure') or session_data.get('tenure', 60)
        
        if not loan_amount or not customer_id:
            return {
                "type": "text",
                "payload": {
                    "message": "Unable to process underwriting. Missing loan amount or customer ID.",
                    "error": True
                },
                "next_agent": "UnderwritingAgent"
            }
        
        # Fetch credit score from mock credit bureau
        credit_result = await MockCreditBureau.get_credit_score(customer_id)
        credit_score = credit_result.get('credit_score', 0)
        pre_approved = credit_result.get('pre_approved_amount', 0)
        max_multiplier = credit_result.get('max_multiplier', 2.0)
        
        # Apply underwriting rules
        if loan_amount <= pre_approved:
            # Rule 1: Auto-approve within pre-approved limit
            return await self._create_approval_response(
                loan_amount, tenure_months, credit_score, pre_approved,
                "Auto-approved within pre-approved limit"
            )
        
        elif loan_amount <= (pre_approved * max_multiplier):
            # Rule 2: Request salary slip and check EMI ratio
            salary_check = context.get('salary_check')
            salary_file_id = context.get('salary_file_id')
            
            # Handle file_id based salary verification (from /mock/upload_salary)
            if salary_file_id and not salary_check:
                from .mock_apis import MockDocumentVerification
                salary_result = await MockDocumentVerification.get_salary_by_file_id(salary_file_id)
                if salary_result.get('status') == 'verified':
                    salary_check = {
                        'monthly_salary': salary_result.get('monthly_salary', 0),
                        'file_id': salary_file_id
                    }
            
            if salary_check:
                monthly_salary = salary_check.get('monthly_salary', 0)
                
                # Calculate EMI
                interest_rate = 12.0
                monthly_rate = interest_rate / 100 / 12
                if monthly_rate > 0:
                    emi = (loan_amount * monthly_rate * (1 + monthly_rate) ** tenure_months) / \
                          ((1 + monthly_rate) ** tenure_months - 1)
                else:
                    emi = loan_amount / tenure_months
                
                emi_ratio = (emi / monthly_salary) * 100 if monthly_salary > 0 else 100
                
                if emi_ratio <= 50:
                    return await self._create_approval_response(
                        loan_amount, tenure_months, credit_score, pre_approved,
                        f"Approved with salary verification (EMI: {emi_ratio:.1f}% of salary, File ID: {salary_file_id or 'N/A'})"
                    )
                else:
                    return self._create_rejection_response(
                        f"EMI ({emi_ratio:.1f}% of salary) exceeds acceptable limit (50%)",
                        "monthly_salary_too_low"
                    )
            
            # Request salary slip
            return {
                "type": "action",
                "payload": {
                    "message": "Your loan amount exceeds pre-approved limit. We need your salary verification.",
                    "action_type": "request_salary_verification",
                    "loan_amount": loan_amount,
                    "pre_approved": pre_approved
                },
                "next_agent": "UnderwritingAgent",
                "ui_actions": [
                    {
                        "action": "request_file_upload",
                        "document_type": "salary_slip",
                        "label": "Upload Latest Salary Slip",
                        "required": True,
                        "message": f"Loan requested: ₹{loan_amount:,.0f} (₹{pre_approved:,.0f} pre-approved)"
                    }
                ]
            }
        
        else:
            # Rule 3: Reject - exceeds maximum limit
            return self._create_rejection_response(
                f"Loan amount exceeds maximum limit (₹{pre_approved * max_multiplier:,.0f})",
                "exceeds_max_limit"
            )
    
    async def _create_approval_response(self, loan_amount: float, tenure: int, 
                                       credit_score: int, pre_approved: float, reason: str) -> Dict[str, Any]:
        """Create approval response with loan terms."""
        # Calculate final EMI
        interest_rate = 11.5
        monthly_rate = interest_rate / 100 / 12
        emi = (loan_amount * monthly_rate * (1 + monthly_rate) ** tenure) / \
              ((1 + monthly_rate) ** tenure - 1)
        
        return {
            "type": "action",
            "payload": {
                "status": "approved",
                "message": "Congratulations! Your loan application is approved.",
                "reason": reason,
                "loan_terms": {
                    "loan_amount": loan_amount,
                    "interest_rate": interest_rate,
                    "tenure_months": tenure,
                    "monthly_emi": round(emi, 2),
                    "total_amount": round(emi * tenure, 2),
                    "total_interest": round(emi * tenure - loan_amount, 2)
                },
                "credit_score": credit_score,
                "pre_approved_amount": pre_approved
            },
            "next_agent": "SanctionAgent",
            "ui_actions": [
                {
                    "action": "show_approval_details",
                    "terms": {
                        "loan_amount": f"₹{loan_amount:,.0f}",
                        "interest_rate": f"{interest_rate}%",
                        "tenure": f"{tenure} months",
                        "emi": f"₹{emi:,.0f}",
                        "total_interest": f"₹{round(emi * tenure - loan_amount, 2):,.0f}"
                    }
                },
                {
                    "action": "proceed_button",
                    "label": "Generate Sanction Letter",
                    "next_step": "sanction"
                }
            ]
        }
    
    def _create_rejection_response(self, reason: str, reason_code: str) -> Dict[str, Any]:
        """Create rejection response."""
        return {
            "type": "action",
            "payload": {
                "status": "rejected",
                "message": "We regret to inform you that your loan application could not be approved at this time.",
                "reason": reason,
                "reason_code": reason_code
            },
            "next_agent": None,
            "ui_actions": [
                {
                    "action": "show_rejection",
                    "reason": reason,
                    "contact_message": "Please contact our customer support team for more information."
                }
            ]
        }

class SanctionAgent(WorkerAgent):
    """
    Sanction Agent: Finalizes terms and generates sanction letter PDF.
    
    Creates professional PDF document with:
    - Customer details
    - Loan terms
    - Payment schedule
    - Terms and conditions
    
    Stores PDF in sanction_letters/ directory.
    """
    
    def __init__(self):
        super().__init__("SanctionAgent")
    
    async def handle(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate sanction letter and finalize the process.
        """
        session_data = context.get('session_data', {})
        session_id = session_data.get('session_id', 'unknown')
        customer_name = context.get('customer_name') or session_data.get('customer_name', 'Valued Customer')
        loan_terms = context.get('loan_terms', {})
        
        # Generate PDF sanction letter
        pdf_path = await self._generate_sanction_letter(
            session_id, customer_name, loan_terms
        )
        
        return {
            "type": "action",
            "payload": {
                "message": f"Dear {customer_name}, your sanction letter has been generated.",
                "status": "completed",
                "action_type": "download_pdf",
                "pdf_path": pdf_path,
                "download_link": f"/sanction/{session_id}",
                "next_steps": [
                    "Download your sanction letter",
                    "Review the terms and conditions",
                    "Sign and return within 7 days",
                    "Schedule account opening"
                ]
            },
            "next_agent": None,
            "ui_actions": [
                {
                    "action": "show_completion",
                    "message": "Your loan application process is complete!"
                },
                {
                    "action": "download_button",
                    "label": "Download Sanction Letter",
                    "link": f"/sanction/{session_id}"
                },
                {
                    "action": "next_steps",
                    "steps": [
                        "Review the sanction letter",
                        "Sign the documents",
                        "Submit salary account details",
                        "Complete account opening"
                    ]
                }
            ]
        }
    
    async def _generate_sanction_letter(self, session_id: str, customer_name: str, 
                                        loan_terms: Dict[str, Any]) -> str:
        """
        Generate PDF sanction letter using ReportLab.
        """
        os.makedirs(SANCTION_LETTERS_DIR, exist_ok=True)
        
        pdf_path = os.path.join(SANCTION_LETTERS_DIR, f"{session_id}_sanction_letter.pdf")
        
        # Create PDF document
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        story = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a5490'),
            spaceAfter=30,
            alignment=1  # Center
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1a5490'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph("LOAN SANCTION LETTER", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Header info
        header_data = [
            ["Tata Capital Limited", "Date:", datetime.now().strftime("%Y-%m-%d")],
            ["SANCTION LETTER", "Reference:", f"TC/{session_id}"]
        ]
        header_table = Table(header_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Customer details
        story.append(Paragraph("APPLICANT DETAILS", heading_style))
        cust_data = [
            ["Name:", customer_name],
            ["Customer ID:", session_id],
            ["Date of Issue:", datetime.now().strftime("%d-%b-%Y")]
        ]
        cust_table = Table(cust_data, colWidths=[2*inch, 4*inch])
        cust_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#e8f0f7')])
        ]))
        story.append(cust_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Loan details
        story.append(Paragraph("LOAN TERMS AND CONDITIONS", heading_style))
        
        loan_amount = loan_terms.get('loan_amount', 0)
        interest_rate = loan_terms.get('interest_rate', 0)
        tenure = loan_terms.get('tenure_months', 60)
        emi = loan_terms.get('monthly_emi', 0)
        total_amount = loan_terms.get('total_amount', 0)
        
        terms_data = [
            ["Loan Amount:", f"₹{loan_amount:,.2f}"],
            ["Rate of Interest:", f"{interest_rate}% p.a."],
            ["Tenure:", f"{tenure} months"],
            ["Monthly EMI:", f"₹{emi:,.2f}"],
            ["Total Amount Payable:", f"₹{total_amount:,.2f}"],
            ["Processing Fee:", f"₹{loan_amount * 0.01:,.2f}"]
        ]
        terms_table = Table(terms_data, colWidths=[2.5*inch, 3.5*inch])
        terms_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#e8f0f7')]),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(terms_table)
        story.append(Spacer(1, 0.3*inch))
        
        # Footer
        story.append(Paragraph(
            "This is a computer-generated document and does not require signature.",
            styles['Normal']
        ))
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph(
            "Authorized by Tata Capital Limited",
            ParagraphStyle('footer', parent=styles['Normal'], alignment=1, fontName='Helvetica-Bold')
        ))
        
        # Build PDF
        doc.build(story)
        
        return pdf_path
