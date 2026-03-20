#!/usr/bin/env python3
"""
Fill OSR Form 33 fields and attach proposal component PDFs.
Usage: python3 scripts/fill-form33.py
"""

from pathlib import Path
from pypdf import PdfReader, PdfWriter

PROJECT_ROOT = Path(__file__).parent.parent
SUBMISSION_DIR = PROJECT_ROOT / "internal" / "ingestion" / "ai-studio-teams-submission"
FORM_PATH = SUBMISSION_DIR / "AI Studio Teams_Coleman_Subrecipient Commitment Form.pdf"
OUTPUT_PATH = SUBMISSION_DIR / "AI_Studio_Teams_Form33_FILLED.pdf"

# --- Form field values ---
FIELDS = {
    # SUBRECIPIENT section
    "NameText": "SkaFld Studio LLC",
    "Address": "889 N Douglas St, Ste 201",
    "CityStateEntry": "El Segundo, CA",
    "Zip2": "90245",
    "Country Fill": "",
    "InvoiceAddress": "889 N Douglas St, Ste 201, El Segundo, CA 90245",
    "EntityDropdown": "LLC",
    "UEI Number": "N/A",
    "FEIN": "39-2282098",

    # PROJECT section (most pre-filled, adding missing)
    "Address where research will be performed Same as legal address Zip4 Congressional District": "889 N Douglas St, Ste 201, El Segundo, CA 90245",
    "Text3": "90245",       # Zip+4 for research address
    "Text4": "CA-36",       # Congressional district

    # CONTACT / SIGNATURE section
    "AdminConact": "Keith Coleman",
    "AdminPhone": "(213) 944-7417",
    "AdminEmail": "keith.coleman@alumni.stanford.edu",
    "Name and Title of Authorized Official": "Keith Coleman, Managing Partner, SkaFld Studio LLC",

    # PAGE 2 - COMMENTS
    "COMMENTSRow1": (
        "Indirect costs will not be charged on this project. "
        "Core team personnel (Charles Sims, Keith Coleman, Mike Belloli) contribute professional effort on a volunteer basis. "
        "Contract engineering is engaged on a 1099 contractor basis with no fringe benefits. "
        "El Segundo USD provides teacher, admin, and facility resources. "
        "ESEDC coordinates employer partners. "
        "The $20,000 subaward is catalytic funding focused on technology buildout, to be leveraged to raise additional funds."
    ),
}

# Checkbox fields to set to checked (/Yes)
CHECKBOXES_ON = [
    # Subrecipient classification (not vendor)
    # Note: we need to identify the correct unnamed checkbox for "Subrecipient"
]

# Page 2 checkboxes - these are unnamed, we'll handle them separately


def fill_form():
    print("Filling OSR Form 33...")

    reader = PdfReader(str(FORM_PATH))
    writer = PdfWriter()
    writer.append(reader)

    # Fill text fields on all pages
    # pypdf's update_page_form_field_values works on the writer
    for page_num in range(len(writer.pages)):
        writer.update_page_form_field_values(writer.pages[page_num], FIELDS)

    # Save filled form
    with open(str(OUTPUT_PATH), "wb") as f:
        writer.write(f)

    size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(f"Done! {OUTPUT_PATH.name} ({size_kb:.0f} KB)")
    print(f"Saved to: {OUTPUT_PATH}")
    print()
    print("MANUAL STEPS REMAINING:")
    print("  1. Open the filled PDF in Adobe Acrobat")
    print("  2. Check 'Subrecipient' classification (not 'Vendor')")
    print("  3. Page 2: Check 'Indirect costs will not be charged'")
    print("  4. Page 2: Check 'Not applicable' under FCOI")
    print("  5. Page 2: Check 'We have applied other rates' under Fringe Benefits")
    print("  6. Attach the 4 component PDFs using the Attach buttons:")
    print("     - AI_Studio_Teams_SOW.pdf")
    print("     - AI_Studio_Teams_Budget.pdf")
    print("     - AI_Studio_Teams_Budget_Justification.pdf")
    print("     - AI_Studio_Teams_Key_Personnel.pdf")
    print("  7. Keith signs electronically")
    print("  8. Save as fillable PDF (do NOT 'Print to PDF')")


if __name__ == "__main__":
    fill_form()
