#!/usr/bin/env python3
"""
Generate branded PDF for Stanford OSR Form 33 submission attachments.
Combines Statement of Work, Detailed Budget, and Budget Justification
into a single professionally formatted document.

Usage: python3 scripts/generate-submission-pdf.py
Output: internal/ingestion/ai-studio-teams-submission/AI_Studio_Teams_Proposal_Package.pdf

Dependencies: pip3 install fpdf2
"""

from pathlib import Path
from fpdf import FPDF

# --- Paths ---
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "internal" / "ingestion" / "ai-studio-teams-submission"
OUTPUT_FILE = OUTPUT_DIR / "AI_Studio_Teams_Proposal_Package.pdf"
LOGO_PATH = PROJECT_ROOT / "static" / "img" / "logo.svg"

# --- Brand ---
CARDINAL = (140, 21, 21)
CARDINAL_DARK = (95, 14, 14)
DARK = (26, 26, 26)
TEXT = (51, 51, 51)
GRAY = (102, 102, 102)
LIGHT_GRAY = (248, 249, 250)
WHITE = (255, 255, 255)
BORDER = (221, 221, 221)

# --- Meta ---
META = {
    "title": "AI Studio Teams",
    "track": "Track 3: Augment Career Opportunities",
    "org": "SkaFld Studio LLC",
    "address": "889 N Douglas St, Ste 201, El Segundo, CA 90245",
    "ein": "EIN: 39-2282098",
    "pi": "Contact: Keith Coleman",
    "period": "March 1, 2026 - February 28, 2027",
    "amount": "$20,000",
}


class ProposalPDF(FPDF):
    """Custom PDF with branded header/footer."""

    def header(self):
        if self.page_no() == 1:
            self._draw_cover_header()
        else:
            self._draw_page_header()

    def footer(self):
        self.set_y(-18)
        self.set_draw_color(*BORDER)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(3)
        self.set_font("Helvetica", "", 6.5)
        self.set_text_color(*GRAY)
        self.cell(0, 4, "AI Studio Teams  -  Stanford CREATE+AI  -  SkaFld Studio LLC", align="L")
        self.cell(0, 4, f"Page {self.page_no()}/{{nb}}", align="R", new_x="LMARGIN")

    def _draw_cover_header(self):
        # White header with logo + text + cardinal underline
        x0, y0 = self.l_margin, 10
        w = self.w - self.l_margin - self.r_margin

        # Logo - use the actual SVG file rendered as image
        logo_path = str(PROJECT_ROOT / "static" / "img" / "logo.svg")
        try:
            self.image(logo_path, x=x0, y=y0, w=16, h=16)
        except Exception:
            # Fallback: draw cardinal circle with white nodes
            cx, cy, r = x0 + 8, y0 + 8, 7
            self.set_fill_color(*CARDINAL)
            self.set_draw_color(*CARDINAL_DARK)
            self.ellipse(cx - r, cy - r, r * 2, r * 2, style="FD")
            self.set_fill_color(*WHITE)
            # Neural net nodes matching logo.svg layout (scaled to r=7 from viewBox 40)
            for nx, ny, nr in [(0, -4.2, 1.05), (-3.5, 0, 1.05), (0, 0, 1.4), (3.5, 0, 1.05), (-2.8, 4.2, 1.05), (2.8, 4.2, 1.05)]:
                self.ellipse(cx + nx - nr, cy + ny - nr, nr * 2, nr * 2, style="F")
            # Connection lines
            self.set_draw_color(*WHITE)
            self.set_line_width(0.3)
            for x1, y1, x2, y2 in [
                (0, -3.2, -3.5, -1), (0, -3.2, 0, -1.4), (0, -3.2, 3.5, -1),
                (-3.5, 1, -2.8, 3.2), (0, 1.4, -2.8, 3.2), (0, 1.4, 2.8, 3.2), (3.5, 1, 2.8, 3.2),
            ]:
                self.line(cx + x1, cy + y1, cx + x2, cy + y2)
            self.set_line_width(0.2)

        # Title block
        tx = x0 + 22
        self.set_xy(tx, y0)
        self.set_font("Helvetica", "B", 17)
        self.set_text_color(*DARK)
        self.cell(100, 7, META["title"])

        self.set_xy(tx, y0 + 7.5)
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*GRAY)
        self.cell(100, 4, f"Stanford CREATE+AI Challenge  -  {META['track']}")

        # Doc label pill
        self.set_xy(tx, y0 + 13)
        self.set_fill_color(*CARDINAL)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 6)
        label = getattr(self, '_doc_label', "PROPOSAL PACKAGE").upper()
        lw = self.get_string_width(label) + 8
        self.cell(lw, 4.5, label, fill=True, align="C")

        # Right meta
        rx = self.w - self.r_margin
        self.set_text_color(*GRAY)
        self.set_font("Helvetica", "B", 7.5)
        self.set_xy(rx - 60, y0)
        self.cell(60, 3.5, META["org"], align="R")
        self.set_font("Helvetica", "", 7)
        for i, line in enumerate([META["address"], META["ein"], "", META["pi"], META["period"]]):
            self.set_xy(rx - 60, y0 + 4 + i * 3.2)
            self.cell(60, 3, line, align="R")

        # Cardinal line
        line_y = y0 + 22
        self.set_draw_color(*CARDINAL)
        self.set_line_width(0.7)
        self.line(self.l_margin, line_y, self.w - self.r_margin, line_y)
        self.set_line_width(0.2)

        self.set_y(line_y + 6)

    def _draw_page_header(self):
        self.set_y(10)
        self.set_font("Helvetica", "", 6.5)
        self.set_text_color(*GRAY)
        self.cell(0, 3, f"AI Studio Teams  -  Proposal Package", align="L")
        self.cell(0, 3, META["org"], align="R", new_x="LMARGIN")
        self.set_draw_color(*BORDER)
        self.line(self.l_margin, 15, self.w - self.r_margin, 15)
        self.set_y(19)

    # --- Content helpers ---

    def section_heading(self, number, title):
        self.ln(2)
        # Check if we need a page break (keep heading with content)
        if self.get_y() > 250:
            self.add_page()

        y = self.get_y()
        # Number circle
        self.set_fill_color(*CARDINAL)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 8)
        cx = self.l_margin + 3.5
        self.ellipse(cx - 3.5, y, 7, 7, style="F")
        self.set_xy(cx - 3.5, y + 0.3)
        self.cell(7, 6.5, str(number), align="C")

        # Title text
        self.set_xy(self.l_margin + 10, y)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(*CARDINAL)
        self.cell(0, 7, title)

        # Underline
        self.set_draw_color(*CARDINAL)
        self.set_line_width(0.5)
        ul_y = y + 8
        self.line(self.l_margin, ul_y, self.w - self.r_margin, ul_y)
        self.set_line_width(0.2)
        self.set_y(ul_y + 4)

    def sub_heading(self, title):
        if self.get_y() > 255:
            self.add_page()
        self.ln(1.5)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(*DARK)
        self.cell(0, 4.5, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(0.5)

    def body_text(self, text):
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*TEXT)
        self.multi_cell(0, 3.8, text)
        self.ln(0.5)

    def bold_text(self, label, text):
        self.set_font("Helvetica", "B", 8.5)
        self.set_text_color(*DARK)
        lw = self.get_string_width(label + " ") + 1
        self.cell(lw, 3.8, label + " ")
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*TEXT)
        self.multi_cell(0, 3.8, text)
        self.ln(0.3)

    def bullet(self, text, bold_prefix=None):
        x = self.l_margin + 4
        self.set_x(x)
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*TEXT)
        bullet_w = 4
        self.cell(bullet_w, 3.8, "-")
        if bold_prefix:
            self.set_font("Helvetica", "B", 8.5)
            bw = self.get_string_width(bold_prefix + " ") + 1
            self.cell(bw, 3.8, bold_prefix + " ")
            self.set_font("Helvetica", "", 8.5)
            self.multi_cell(0, 3.8, text)
        else:
            self.multi_cell(0, 3.8, text)
        self.ln(0.2)

    def table(self, headers, rows, col_widths=None):
        if self.get_y() > 240:
            self.add_page()
        avail = self.w - self.l_margin - self.r_margin
        if col_widths is None:
            col_widths = [avail / len(headers)] * len(headers)
        else:
            # Convert proportions to absolute
            col_widths = [w * avail for w in col_widths]

        # Header
        self.set_fill_color(*DARK)
        self.set_text_color(*WHITE)
        self.set_font("Helvetica", "B", 7.5)
        for i, h in enumerate(headers):
            self.cell(col_widths[i], 5, h, border=0, fill=True, align="L")
        self.ln()

        # Rows
        self.set_text_color(*TEXT)
        for ri, row in enumerate(rows):
            is_total = row.get("_total", False) if isinstance(row, dict) else False
            cells = row.get("cells", row) if isinstance(row, dict) else row

            if ri % 2 == 1 and not is_total:
                self.set_fill_color(*LIGHT_GRAY)
                fill = True
            else:
                self.set_fill_color(*WHITE)
                fill = is_total

            if is_total:
                self.set_draw_color(*DARK)
                y = self.get_y()
                self.line(self.l_margin, y, self.l_margin + avail, y)
                self.set_font("Helvetica", "B", 8.5)
            else:
                self.set_font("Helvetica", "", 8.5)

            for i, c in enumerate(cells):
                self.cell(col_widths[i], 4.5, str(c), border=0, fill=fill, align="L")
            self.ln()

        # Bottom border
        self.set_draw_color(*BORDER)
        y = self.get_y()
        self.line(self.l_margin, y, self.l_margin + avail, y)
        self.ln(2)

    def meta_grid(self, items):
        """Render a key-value grid (used for SOW header)."""
        avail = self.w - self.l_margin - self.r_margin
        col_w = avail / 3
        self.set_fill_color(*LIGHT_GRAY)
        self.set_draw_color(*BORDER)
        y0 = self.get_y()
        rows_needed = (len(items) + 2) // 3
        box_h = rows_needed * 9 + 4
        self.rect(self.l_margin, y0, avail, box_h, style="DF")

        for i, (label, value) in enumerate(items):
            col = i % 3
            row = i // 3
            x = self.l_margin + col * col_w + 4
            y = y0 + 2 + row * 9

            self.set_xy(x, y)
            self.set_font("Helvetica", "B", 6)
            self.set_text_color(*GRAY)
            self.cell(col_w - 8, 3, label.upper())

            self.set_xy(x, y + 3)
            self.set_font("Helvetica", "B", 8.5)
            self.set_text_color(*DARK)
            self.cell(col_w - 8, 4.5, value)

        self.set_y(y0 + box_h + 4)


def new_pdf(doc_label="PROPOSAL PACKAGE"):
    """Create a fresh branded PDF instance."""
    pdf = ProposalPDF("P", "mm", "Letter")
    pdf._doc_label = doc_label
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=22)
    pdf.set_margins(18, 10, 18)
    return pdf


def add_sow(pdf):
    """Add Statement of Work content."""
    pdf.add_page()
    pdf.section_heading(1, "Statement of Work")

    pdf.meta_grid([
        ("Project Title", META["title"]),
        ("Contact", "Keith Coleman"),
        ("Organization", META["org"]),
        ("Period", META["period"]),
        ("Amount", META["amount"]),
    ])

    pdf.sub_heading("Background")
    pdf.body_text(
        "AI Studio Teams is a portfolio-based career pathway program addressing the disappearance of "
        "entry-level positions. High school students build employer-validated portfolios by solving real "
        "problems for local companies using AI, developing durable metacognitive skills that transfer "
        "across any tool or domain. The program pilots in El Segundo, CA, serving 96 students across "
        "8 teams with 12 employer partners, powered by the SkaFld Trailhead AI learning platform."
    )
    pdf.body_text(
        "The El Segundo Unified School District Superintendent has granted full approval to implement "
        "the program and committed to providing teacher, administrative, and facility resources. The "
        "El Segundo Economic Development Committee (ESEDC) has committed to sourcing and coordinating "
        "employer partners for the pilot."
    )
    pdf.body_text(
        "This $20,000 subaward will be directed primarily toward technology buildout of the SkaFld "
        "Trailhead platform. Core team leadership and district personnel contribute on a volunteer basis. "
        "The Stanford award serves as catalytic funding to validate the model and raise additional investment."
    )

    pdf.sub_heading("Scope of Work")

    pdf.bold_text("Platform Development & Technology (Months 1-6):", "")
    pdf.bullet("Complete SkaFld Trailhead platform: AI Coaching Engine (Socratic questioning for problem decomposition), "
               "Portfolio Review System (employer validation portal), Student Progression Tracking, Teacher Dashboard.")
    pdf.bullet("Implement COPPA/FERPA compliance: consent management, data encryption, content moderation, enterprise SSO.")

    pdf.bold_text("Employer Partnership Development (Months 1-6):", "")
    pdf.bullet("Recruit and onboard 12 employer partners in El Segundo's aerospace/tech corridor (Boeing, Northrop Grumman, etc.).")
    pdf.bullet("Establish Employer Council governance for portfolio standards and micro-internship design.")

    pdf.bold_text("Pilot Implementation (Months 4-12):", "")
    pdf.bullet("Launch El Segundo pilot: student recruitment, team formation, teacher mentor preparation.")
    pdf.bullet("Deliver weekly 90-minute sessions using the SkaFld Ideation Methodology curriculum.")
    pdf.bullet("Facilitate quarterly employer portfolio review panels.")

    pdf.bold_text("Stanford Collaboration & Assessment (Months 1-12):", "")
    pdf.bullet("Serve as liaison to Stanford Accelerator for Learning (SAL); participate in convenings and reporting.")
    pdf.bullet("Track learning outcomes with disaggregated equity monitoring (50% female/male, 40% FRL, 30% first-gen).")
    pdf.bullet("Develop Year 2+ sustainability model and expansion strategy.")

    pdf.sub_heading("Deliverables")
    pdf.table(
        ["Deliverable", "Due"],
        [
            ["SkaFld Trailhead platform ready for pilot", "Month 3"],
            ["12 signed employer partner commitments", "Month 3"],
            ["Pilot launch: 96 students across 8 teams", "Month 5"],
            ["Mid-year progress report to Stanford SAL", "Month 6"],
            ["First employer portfolio review cycle", "Month 9"],
            ["24+ micro-internship placements", "Month 11"],
            ["Year-end report with outcomes and Year 2 plan", "Month 12"],
        ],
        col_widths=[0.75, 0.25],
    )

    pdf.sub_heading("Key Personnel")
    pdf.table(
        ["Name", "Role", "Effort"],
        [
            ["Keith Coleman", "Subrecipient PI, Strategy & Partnerships", "40% (in-kind)"],
            ["Charles Sims", "Project Director", "50% (in-kind)"],
            ["Mike Belloli", "Technology & Operations", "30% (in-kind)"],
            ["Contract Engineer(s)", "Platform development", "~120 hrs (paid)"],
        ],
        col_widths=[0.28, 0.47, 0.25],
    )

    pdf.sub_heading("Location of Performance")
    pdf.bullet("889 N Douglas St, Suite 201, El Segundo, CA 90245", bold_prefix="Primary:")
    pdf.bullet("El Segundo Unified School District, El Segundo, CA", bold_prefix="Pilot Site:")
    pdf.bullet("SAL convenings and PI meetings, as scheduled", bold_prefix="Stanford:")

    return pdf


def add_budget(pdf):
    """Add Detailed Budget content."""
    pdf.add_page()
    pdf.section_heading(2, "Detailed Budget")

    pdf.body_text(
        "The $20,000 subaward is focused on technology buildout for the SkaFld Trailhead platform. "
        "Core team leadership contributes on a volunteer basis. El Segundo USD provides teacher, admin, "
        "and facility resources. ESEDC coordinates employer partners. This catalytic investment will be "
        "leveraged to raise additional funds from district CTE allocations, employer partnerships, and "
        "workforce development grants."
    )

    pdf.sub_heading("Budget Summary")
    pdf.table(
        ["Category", "Amount"],
        [
            ["A. Personnel (Contract Engineering)", "$6,000"],
            ["B. Technology & Platform Development", "$10,000"],
            ["C. Travel", "$2,000"],
            ["D. Other Direct Costs", "$2,000"],
            ["E. Indirect Costs (F&A)", "$0"],
            {"cells": ["Total", "$20,000"], "_total": True},
        ],
        col_widths=[0.75, 0.25],
    )

    pdf.sub_heading("A. Personnel  -  $6,000")
    pdf.table(
        ["Role", "Basis", "Amount"],
        [["Contract Software Engineer(s)", "~120 hrs @ $50/hr", "$6,000"]],
        col_widths=[0.45, 0.30, 0.25],
    )
    pdf.body_text(
        "Contract engineering to complete SkaFld Trailhead features: AI coaching engine, portfolio review "
        "system, student progression tracking. Core team contributes effort on a volunteer basis. "
        "El Segundo USD provides teacher and admin support at no cost to the award."
    )

    pdf.sub_heading("B. Technology & Platform  -  $10,000")
    pdf.table(
        ["Item", "Amount"],
        [
            ["Cloud infrastructure & hosting (12-month pilot)", "$3,000"],
            ["AI/LLM API costs (Socratic coaching engine)", "$3,000"],
            ["Software licenses & dev tools", "$2,000"],
            ["Security & compliance tooling (COPPA/FERPA)", "$2,000"],
        ],
        col_widths=[0.75, 0.25],
    )

    pdf.sub_heading("C. Travel  -  $2,000")
    pdf.table(
        ["Purpose", "Trips", "Amount"],
        [
            ["Stanford SAL convenings & PI meetings", "2", "$1,500"],
            ["El Segundo pilot coordination", "2", "$500"],
        ],
        col_widths=[0.50, 0.20, 0.30],
    )

    pdf.sub_heading("D. Other Direct Costs  -  $2,000")
    pdf.table(
        ["Item", "Amount"],
        [
            ["Curriculum & assessment materials", "$1,000"],
            ["Employer onboarding & communications", "$500"],
            ["Supplies & operational expenses", "$500"],
        ],
        col_widths=[0.75, 0.25],
    )

    pdf.sub_heading("In-Kind Contributions (Not Charged)")
    pdf.table(
        ["Contributor", "Role", "Contribution"],
        [
            ["Charles Sims", "Project Director", "50% / 12 mo (volunteer)"],
            ["Keith Coleman", "Strategy & Partnerships", "40% / 12 mo (volunteer)"],
            ["Mike Belloli", "Technology & Operations", "30% / 12 mo (volunteer)"],
            ["El Segundo USD", "Teachers, admin, facilities", "As needed (committed)"],
            ["ESEDC", "Employer partner coordination", "12 partners (committed)"],
        ],
        col_widths=[0.25, 0.42, 0.33],
    )

    return pdf


def add_justification(pdf):
    """Add Budget Justification content."""
    pdf.add_page()
    pdf.section_heading(3, "Budget Justification")

    pdf.body_text(
        "The $20,000 subaward from Stanford Accelerator for Learning is directed primarily toward technology "
        "buildout. The El Segundo USD Superintendent has approved the program and committed district resources "
        "(teachers, admin, facilities). The ESEDC has committed to coordinating employer partners. Core team "
        "leadership contributes on a volunteer basis. This structure ensures the Stanford award is leveraged to "
        "validate the model and raise additional funds for full-scale operation."
    )

    pdf.sub_heading("A. Personnel  -  $6,000")
    pdf.body_text(
        "Contract engineering (~120 hrs @ $50/hr) to complete SkaFld Trailhead platform features required "
        "for pilot launch: the Socratic AI coaching engine, employer portfolio review portal, and student "
        "progression system. These are specialized development tasks beyond volunteer team capacity."
    )
    pdf.body_text(
        "Core leadership  -  Charles Sims (Project Director, 50%), Keith Coleman (Strategy & Partnerships, 40%), "
        "and Mike Belloli (Technology & Operations, 30%)  -  contribute on a volunteer basis. El Segundo USD "
        "provides teacher mentors, administrative support, and facilities at no cost. ESEDC coordinates all "
        "employer partnerships. This ensures over 80% of the award flows into technology buildout."
    )

    pdf.sub_heading("B. Technology & Platform  -  $10,000")
    pdf.bold_text("Cloud infrastructure ($3,000):",
                  "Hosting, database, CDN, and compute for 96 students, 8 teacher mentors, and 12 employer partners over 12 months.")
    pdf.bold_text("AI/LLM API costs ($3,000):",
                  "The Trailhead AI Coach  -  the program's core differentiator  -  guides students through Socratic problem decomposition. "
                  "Est: 96 students x 4 sessions/week x 40 weeks.")
    pdf.bold_text("Dev tools ($2,000):",
                  "CI/CD, testing, monitoring to ensure platform reliability during the pilot.")
    pdf.bold_text("Security & compliance ($2,000):",
                  "COPPA/FERPA compliance: consent management, encryption, content moderation, enterprise SSO, security auditing.")

    pdf.sub_heading("C. Travel  -  $2,000")
    pdf.bold_text("Stanford convenings ($1,500, 2 trips):",
                  "Required SAL convenings and PI coordination. Includes airfare, one-night lodging, per diem.")
    pdf.bold_text("El Segundo coordination ($500, 2 trips):",
                  "Employer onboarding and school district meetings. Local travel costs.")

    pdf.sub_heading("D. Other Direct Costs  -  $2,000")
    pdf.bold_text("Curriculum materials ($1,000):",
                  "Adapting the SkaFld Ideation Methodology into classroom-ready guides and assessment rubrics.")
    pdf.bold_text("Employer onboarding ($500):",
                  "Professional materials for 12 employer partners (Boeing, Northrop Grumman, etc.).")
    pdf.bold_text("Operational ($500):",
                  "Admin, document management, communication tools.")

    pdf.sub_heading("E. Indirect Costs  -  $0")
    pdf.body_text("No indirect costs charged. All costs are direct expenditures supporting the Statement of Work.")

    pdf.sub_heading("Cost Efficiency & Leverage")
    pdf.body_text(
        "With leadership volunteering, the district providing teachers and facilities, and ESEDC coordinating "
        "employers, over 80% of the award flows directly into technology buildout. The Stanford CREATE+AI "
        "award is the catalytic first dollar  -  it validates the model and provides the credibility to raise "
        "additional funds from district CTE budgets, employer co-investment, and workforce development grants. "
        "The full project delivers a pilot at ~$521/student, a price point designed for sustainable scaling."
    )

    return pdf


def add_key_personnel(pdf):
    """Add Key Personnel Biosketches content."""
    pdf.add_page()
    pdf.section_heading(4, "Key Personnel Biosketches")

    # --- Charles Sims ---
    pdf.sub_heading("Charles Sims  -  Project Director (50% effort, volunteer)")
    pdf.body_text(
        "Charles Sims is the Founder & CEO of SkaFld Studio and creator of the SkaFld Ideation "
        "Methodology for executing high-pressure transformation projects within tight timeframes. "
        "His approach emphasizes rapid iteration, stakeholder alignment, and measurable outcome delivery."
    )
    pdf.bold_text("Role:", "Strategic direction, technology leadership, employer partnerships, program design.")
    pdf.sub_heading("Relevant Experience")
    pdf.bullet("Former CTO, LA Clippers & UTA (United Talent Agency). Led technology transformation "
               "initiatives across major sports and entertainment organizations.")
    pdf.bullet("Developed frameworks for integrating emerging technology into established organizational workflows.")
    pdf.bullet("NYU-educated with deep understanding of educational systems and workforce development.")
    pdf.bullet("Board Member, El Segundo Economic Development Committee. Direct community ties to the "
               "pilot district and local employer ecosystem.", bold_prefix="ESEDC:")

    # --- Keith Coleman ---
    pdf.sub_heading("Keith Coleman  -  Strategy and Partnerships (40% effort, volunteer)")
    pdf.body_text(
        "Keith Coleman brings the policy and strategy awareness essential for responsible AI deployment "
        "- complementing technical AI skills with governance understanding and ethical considerations. "
        "His career spans workforce development and building bridges between education, industry, and policy."
    )
    pdf.bold_text("Role:", "Stanford liaison, policy & strategy expertise, workforce development, equity oversight.")
    pdf.sub_heading("Relevant Experience")
    pdf.bullet("Stanford BA Economics '86. Deep ties to Stanford's innovation ecosystem and interdisciplinary "
               "approach to learning.")
    pdf.bullet("Advisory Scholar, mediaX at Stanford. Connected researchers and industry practitioners to "
               "explore how human insight and technology interaction shape the future of work.")
    pdf.bullet("UN Joint SDG Fund Breakthrough Alliance Co-Chair. Overseeing $290M+ portfolio across 150+ "
               "countries, bringing global perspective on education and workforce development.")
    pdf.bullet("Stanford Angels & Entrepreneurs of SoCal Co-Founder and VP of Impact. Built a community "
               "connecting Stanford alumni with early-stage ventures, fostering mentorship and investment in "
               "education and technology innovation across Southern California.")
    pdf.bullet("Capitol Partners General Partner. 17 years experience in economic opportunity, aerospace/defense "
               "coalition building, and policy-aware technology deployment.")
    pdf.bullet("Delegate Assembly, CA School Boards Association. Direct experience with California education "
               "governance and district-level decision making.")

    # --- Mike Belloli ---
    pdf.sub_heading("Mike Belloli  -  Technology and Operations (30% effort, volunteer)")
    pdf.body_text(
        "Mike Belloli is COO of SkaFld Studio, Co-Founder of Lyfe AI & Defy Mortgage, and a full-stack "
        "developer and architect. He manages financials, pitch strategy, and digital infrastructure for "
        "the SkaFld Trailhead platform, ensuring operational excellence across all technical and business domains."
    )
    pdf.bold_text("Role:", "Platform strategy, financial modeling, digital infrastructure, data privacy compliance.")
    pdf.sub_heading("Relevant Experience")
    pdf.bullet("Full-stack development and technical architecture for the SkaFld Trailhead platform.")
    pdf.bullet("Management of financial models, investor materials, and digital presence.")
    pdf.bullet("Expert in educational data privacy (COPPA/FERPA) and secure AI implementation.")

    return pdf


def save_pdf(pdf, filename):
    """Save a PDF and print status."""
    path = OUTPUT_DIR / filename
    pdf.output(str(path))
    size_kb = path.stat().st_size / 1024
    print(f"  {filename} ({size_kb:.0f} KB)")
    return path


def main():
    print("Generating AI Studio Teams submission PDFs...\n")

    # 1. Statement of Work (standalone)
    pdf = new_pdf("Statement of Work")
    add_sow(pdf)
    save_pdf(pdf, "AI_Studio_Teams_SOW.pdf")

    # 2. Detailed Budget (standalone)
    pdf = new_pdf("Detailed Budget")
    add_budget(pdf)
    save_pdf(pdf, "AI_Studio_Teams_Budget.pdf")

    # 3. Budget Justification (standalone)
    pdf = new_pdf("Budget Justification")
    add_justification(pdf)
    save_pdf(pdf, "AI_Studio_Teams_Budget_Justification.pdf")

    # 4. Key Personnel Biosketches (standalone)
    pdf = new_pdf("Key Personnel")
    add_key_personnel(pdf)
    save_pdf(pdf, "AI_Studio_Teams_Key_Personnel.pdf")

    # 5. Combined package (for reference)
    pdf = new_pdf("Proposal Package")
    add_sow(pdf)
    add_budget(pdf)
    add_justification(pdf)
    add_key_personnel(pdf)
    save_pdf(pdf, "AI_Studio_Teams_Proposal_Package.pdf")

    print(f"\nAll PDFs saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
