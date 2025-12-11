"""
PDF Sanction Letter Helper using ReportLab.

Generates professional one-page sanction letters with:
- Customer name and details
- Loan amount, tenure, interest rate
- Monthly EMI and total payable
- Sanction date and reference number
"""

import os
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors


# Directory for storing PDFs
SANCTIONS_DIR = "data/sanctions"


class SanctionLetterGenerator:
    """Helper class to generate PDF sanction letters."""
    
    def __init__(self, output_dir: str = SANCTIONS_DIR):
        """Initialize the generator with output directory."""
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
    
    def generate(
        self,
        session_id: str,
        name: str,
        loan_amount: float,
        tenure: int,
        interest: float,
        emi: float,
        sanction_date: str = None,
        **kwargs
    ) -> str:
        """
        Generate a professional sanction letter PDF.
        
        Args:
            session_id: Unique session identifier
            name: Customer name
            loan_amount: Loan amount in rupees
            tenure: Loan tenure in months
            interest: Interest rate per annum
            emi: Monthly EMI amount
            sanction_date: Sanction date (defaults to today)
            **kwargs: Additional fields (total_amount, processing_fee, etc.)
        
        Returns:
            Path to generated PDF file
        """
        if sanction_date is None:
            sanction_date = datetime.now().strftime("%d-%b-%Y")
        
        # Generate PDF path
        pdf_path = os.path.join(self.output_dir, f"{session_id}.pdf")
        
        # Create PDF document
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=letter,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )
        
        story = []
        
        # Get styles
        styles = getSampleStyleSheet()
        
        # Define custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor('#003366'),
            spaceAfter=6,
            alignment=1,  # Center
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#666666'),
            spaceAfter=12,
            alignment=1,  # Center
            fontName='Helvetica'
        )
        
        section_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#003366'),
            spaceAfter=8,
            spaceBefore=8,
            fontName='Helvetica-Bold',
            borderColor=colors.HexColor('#cccccc'),
            borderPadding=4,
            backColor=colors.HexColor('#f0f0f0')
        )
        
        label_style = ParagraphStyle(
            'Label',
            parent=styles['Normal'],
            fontSize=9,
            fontName='Helvetica-Bold',
            textColor=colors.HexColor('#333333')
        )
        
        value_style = ParagraphStyle(
            'Value',
            parent=styles['Normal'],
            fontSize=9,
            fontName='Helvetica',
            textColor=colors.HexColor('#000000')
        )
        
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#666666'),
            alignment=1,  # Center
            fontName='Helvetica-Oblique'
        )
        
        # Title
        story.append(Paragraph("TATA CAPITAL", title_style))
        story.append(Paragraph("Loan Sanction Letter", subtitle_style))
        story.append(Spacer(1, 0.15*inch))
        
        # Header Information
        header_data = [
            ["Date:", sanction_date, "Reference No.:", f"TC/{session_id[:8]}"],
        ]
        header_table = Table(header_data, colWidths=[1.2*inch, 1.8*inch, 1.5*inch, 2.5*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Applicant Details Section
        story.append(Paragraph("APPLICANT DETAILS", section_style))
        
        applicant_data = [
            ["Name:", name],
            ["Customer ID:", session_id],
            ["Date of Issue:", sanction_date],
        ]
        applicant_table = Table(applicant_data, colWidths=[1.8*inch, 4.2*inch])
        applicant_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f0f7')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(applicant_table)
        story.append(Spacer(1, 0.15*inch))
        
        # Loan Terms Section
        story.append(Paragraph("LOAN TERMS AND CONDITIONS", section_style))
        
        # Calculate total amount
        total_amount = kwargs.get('total_amount', emi * tenure)
        processing_fee = kwargs.get('processing_fee', loan_amount * 0.01)
        
        terms_data = [
            ["Loan Amount:", f"₹ {loan_amount:,.2f}"],
            ["Rate of Interest:", f"{interest}% per annum"],
            ["Tenure:", f"{tenure} months"],
            ["Monthly EMI:", f"₹ {emi:,.2f}"],
            ["Total Amount Payable:", f"₹ {total_amount:,.2f}"],
            ["Processing Fee:", f"₹ {processing_fee:,.2f}"],
        ]
        
        terms_table = Table(terms_data, colWidths=[2.2*inch, 3.8*inch])
        terms_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8f0f7')),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(terms_table)
        story.append(Spacer(1, 0.15*inch))
        
        # Terms and Conditions
        story.append(Paragraph("TERMS AND CONDITIONS", section_style))
        
        terms_text = (
            "1. This sanction is valid for 30 days from the date of issue.<br/>"
            "2. Applicant must accept and sign this letter within the validity period.<br/>"
            "3. The processing fee is non-refundable once the loan is disbursed.<br/>"
            "4. All applicable taxes and levies as per law shall be borne by the applicant.<br/>"
            "5. Early repayment allowed with applicable prepayment charges."
        )
        story.append(Paragraph(terms_text, styles['Normal']))
        story.append(Spacer(1, 0.15*inch))
        
        # Footer
        story.append(Paragraph(
            "This is a computer-generated document and does not require a signature.",
            footer_style
        ))
        story.append(Spacer(1, 0.05*inch))
        story.append(Paragraph(
            "Authorized by Tata Capital Limited",
            ParagraphStyle(
                'Footer2',
                parent=footer_style,
                alignment=1,
                fontName='Helvetica-Bold',
                fontSize=9
            )
        ))
        
        # Build PDF
        doc.build(story)
        
        return pdf_path


def generate_sanction_letter(
    session_id: str,
    name: str,
    loan_amount: float,
    tenure: int,
    interest: float,
    emi: float,
    sanction_date: str = None,
    **kwargs
) -> str:
    """
    Standalone function to generate a sanction letter PDF.
    
    Args:
        session_id: Unique session identifier
        name: Customer name
        loan_amount: Loan amount in rupees
        tenure: Loan tenure in months
        interest: Interest rate per annum
        emi: Monthly EMI amount
        sanction_date: Sanction date (defaults to today)
        **kwargs: Additional fields
    
    Returns:
        Path to generated PDF file
    """
    generator = SanctionLetterGenerator()
    return generator.generate(
        session_id=session_id,
        name=name,
        loan_amount=loan_amount,
        tenure=tenure,
        interest=interest,
        emi=emi,
        sanction_date=sanction_date,
        **kwargs
    )
