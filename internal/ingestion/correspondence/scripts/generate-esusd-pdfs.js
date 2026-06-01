/**
 * SkaFld Trailhead — ESUSD Partnership PDF Generator
 *
 * Branding matches SkaFld Foundry document template:
 *   - Display / Headlines:  Manrope (geometric sans-serif, extra bold)
 *   - Body / UI:            Inter (sans-serif)
 *
 * Color Palette (from skafldstudio.com):
 *   - Primary Orange:   #E07800
 *   - Primary Dark:     #1A1A1A
 *   - Body Text:        #333333
 *   - Gray:             #919191
 *   - Cream:            #FAF6F1
 *   - Accent Line:      #F0E6D9
 *   - Header BG:        #2D2D2D
 *
 * PDF Layout (Letter 8.5 x 11"):
 *   - Margins: 0.85" top, 0.75" bottom, 0.85" left/right
 *   - Running header: orange rule + logo + doc type (right)
 *   - Running footer: company name (left) + page numbers (right)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// ── Brand Colors ──────────────────────────────────────────────────
const BRAND = {
  orange:     '#E07800',
  dark:       '#1A1A1A',
  body:       '#333333',
  subtitle:   '#555555',
  gray:       '#919191',
  cream:      '#FAF6F1',
  accent:     '#F0E6D9',
  headerBg:   '#2D2D2D',
  white:      '#FFFFFF',
  lightGray:  '#F5F5F5',
};

// ── Page Dimensions ───────────────────────────────────────────────
const MARGIN = {
  top:    '0.85in',
  bottom: '0.75in',
  left:   '0.85in',
  right:  '0.85in',
};

// ── Logo ──────────────────────────────────────────────────────────
const LOGO_PATH = path.join(__dirname, '..', '..', '..', '..', 'static', 'img', 'skafld', 'skafld logo FINAL copy.png');
const LOGO_B64 = fs.existsSync(LOGO_PATH)
  ? `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`
  : null;

// ── Google Fonts import (Manrope + Inter) ─────────────────────────
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');`;


// ═════════════════════════════════════════════════════════════════
// MARKDOWN → HTML
// ═════════════════════════════════════════════════════════════════

function markdownToHtml(md) {
  md = md.replace(/^\s*---[\s\S]*?---\n*/, '');

  let html = md;

  // Tables
  html = html.replace(/^(\|.+\|)\n(\|[\s:|-]+\|)\n((?:\|.+\|\n?)+)/gm, (match, headerRow, sepRow, bodyRows) => {
    const parseCells = (row) => row.split('|').slice(1, -1).map(c => c.trim());
    const thCells = parseCells(headerRow).map(c => `<th>${inlineFmt(c)}</th>`).join('');
    const rows = bodyRows.trim().split('\n').map((row, i) => {
      const cells = parseCells(row).map(c => `<td>${inlineFmt(c)}</td>`).join('');
      return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">${cells}</tr>`;
    }).join('');
    return `<table><thead><tr>${thCells}</tr></thead><tbody>${rows}</tbody></table>\n`;
  });

  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^---+$/gm, '<hr/>');
  // Page breaks from <!-- PAGE_BREAK --> markers
  html = html.replace(/<!--\s*PAGE_BREAK\s*-->/g, '<div class="page-break"></div>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  const lines = html.split('\n');
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    if (trimmed.startsWith('<')) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }
  return result.join('\n');
}

function inlineFmt(t) {
  return t
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}


// ═════════════════════════════════════════════════════════════════
// HTML TEMPLATE
// ═════════════════════════════════════════════════════════════════

function buildHtml(title, subtitle, docType, contentHtml) {
  const logoHtml = LOGO_B64
    ? `<img src="${LOGO_B64}" class="logo-img" />`
    : `<div class="logo-text">SKAFLD</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${FONT_IMPORT}

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: ${BRAND.body};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Cover / Title Block (first page only) ───────────────── */
  .cover {
    position: relative;
    border-left: 5px solid ${BRAND.orange};
    padding: 0 0 24px 24px;
    margin-bottom: 28px;
  }
  .cover::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${BRAND.accent};
  }
  .cover-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .logo-img {
    height: 30px;
    display: block;
  }
  .logo-text {
    font-family: 'Manrope', sans-serif;
    font-size: 24pt;
    font-weight: 800;
    color: ${BRAND.orange};
    letter-spacing: 0.04em;
  }
  .cover .meta {
    text-align: right;
    font-size: 8pt;
    color: ${BRAND.gray};
    line-height: 1.7;
    white-space: nowrap;
  }
  .cover-titles h1 {
    font-family: 'Manrope', sans-serif;
    font-size: 22pt;
    font-weight: 800;
    color: ${BRAND.dark};
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0;
    border: none;
  }
  .cover-titles .sub {
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    color: ${BRAND.subtitle};
    margin-top: 5px;
  }
  .cover-titles .dtype {
    font-family: 'Manrope', sans-serif;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: ${BRAND.orange};
    margin-top: 8px;
  }

  /* ── Content Typography ──────────────────────────────────── */
  h1 {
    font-family: 'Manrope', sans-serif;
    font-size: 18pt;
    font-weight: 700;
    color: ${BRAND.dark};
    margin: 26px 0 8px;
    border: none;
    page-break-after: avoid;
    break-after: avoid;
  }
  h2 {
    font-family: 'Manrope', sans-serif;
    font-size: 14pt;
    font-weight: 700;
    color: ${BRAND.dark};
    margin: 22px 0 6px;
    padding-bottom: 3px;
    border-bottom: 2px solid ${BRAND.orange};
    page-break-after: avoid;
    break-after: avoid;
  }
  h3 {
    font-family: 'Inter', sans-serif;
    font-size: 12pt;
    font-weight: 700;
    color: ${BRAND.orange};
    margin: 16px 0 4px;
    page-break-after: avoid;
    break-after: avoid;
  }
  h4 {
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    font-weight: 600;
    color: ${BRAND.gray};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 12px 0 3px;
    page-break-after: avoid;
    break-after: avoid;
  }
  .content > h1:first-child { display: none; }

  p { margin: 4px 0; line-height: 1.55; }

  ul, ol { margin: 5px 0 5px 20px; }
  li { margin: 2px 0; line-height: 1.5; }

  strong { font-weight: 700; color: ${BRAND.dark}; }
  em { font-style: italic; }

  code {
    background: ${BRAND.cream};
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 9pt;
    font-family: 'SF Mono', 'Consolas', monospace;
  }

  blockquote {
    border-left: 3px solid ${BRAND.orange};
    padding: 8px 16px;
    margin: 10px 0;
    color: ${BRAND.subtitle};
    font-style: italic;
    background: ${BRAND.cream};
    border-radius: 0 4px 4px 0;
  }

  hr {
    border: none;
    border-top: 1px solid ${BRAND.accent};
    margin: 18px 0;
  }

  /* ── Tables (Foundry style) ──────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9pt;
    overflow: hidden;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  thead tr {
    background: ${BRAND.headerBg};
    border-top: 3px solid ${BRAND.orange};
    border-bottom: 3px solid ${BRAND.orange};
  }
  th {
    padding: 8px 12px;
    text-align: left;
    font-family: 'Manrope', sans-serif;
    font-weight: 700;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${BRAND.white};
  }
  td {
    padding: 7px 12px;
    border-bottom: 1px solid ${BRAND.accent};
    vertical-align: top;
    line-height: 1.4;
  }
  tbody tr.even { background: ${BRAND.white}; }
  tbody tr.odd { background: ${BRAND.lightGray}; }
  tbody tr:last-child td {
    border-bottom: 2px solid ${BRAND.dark};
  }

  /* ── Page Breaks ─────────────────────────────────────────── */
  .page-break {
    page-break-after: always;
    break-after: page;
    height: 0;
    margin: 0;
    padding: 0;
  }
</style>
</head>
<body>
  <div class="cover">
    <div class="cover-top">
      <div>${logoHtml}</div>
      <div class="meta">
        SkaFld Studio LLC<br>
        889 N Douglas St, Ste 201<br>
        El Segundo, CA 90245<br><br>
        Contact: Charles Sims<br>
        charles@skafldstudio.com
      </div>
    </div>
    <div class="cover-titles">
      <h1>${title}</h1>
      <div class="sub">${subtitle}</div>
      <div class="dtype">${docType}</div>
    </div>
  </div>
  <div class="content">
    ${contentHtml}
  </div>
</body>
</html>`;
}


// ═════════════════════════════════════════════════════════════════
// RUNNING HEADER / FOOTER TEMPLATES (Playwright)
// ═════════════════════════════════════════════════════════════════

function buildHeaderTemplate(docType) {
  // Page 1: no logo (cover has its own), just doc type label
  // Page 2+: logo + doc type
  const logoImg = LOGO_B64
    ? `<img src="${LOGO_B64}" style="height:14px;" />`
    : `<span style="font-family:sans-serif;font-weight:800;font-size:10px;color:#E07800;">SKAFLD</span>`;

  // Playwright doesn't support per-page header logic, so we show the small
  // header logo on all pages — it's small enough not to conflict with the cover.
  // The cover logo is large; the header logo is 14px, visually distinct.
  return `<div style="width:100%; padding: 0 0.85in; display:flex; justify-content:space-between; align-items:center; border-bottom: 1.5px solid #E07800; padding-bottom: 6px; font-size: 8px;">
    <div>${logoImg}</div>
    <div style="font-family:sans-serif; font-size:7px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#919191;">${docType}</div>
  </div>`;
}

function buildFooterTemplate() {
  return `<div style="width:100%; padding: 0 0.85in; display:flex; justify-content:space-between; align-items:center; border-top: 1px solid #F0E6D9; padding-top: 6px; font-size: 8px;">
    <div style="font-family:sans-serif; font-size:7.5px; color:#919191; font-style:italic;">SkaFld Trailhead &mdash; SkaFld Studio LLC</div>
    <div style="font-family:sans-serif; font-size:7.5px; color:#919191;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
  </div>`;
}


// ═════════════════════════════════════════════════════════════════
// DOCUMENT CONFIG & GENERATION
// ═════════════════════════════════════════════════════════════════

const PARTNERSHIP_DIR = path.join(__dirname, '..', 'esusd-partnership');

const DOCS = [
  {
    file: 'ESUSD_Partnership_Email.md',
    output: 'ESUSD_Partnership_Email.pdf',
    title: 'SkaFld Trailhead',
    subtitle: 'Partnership Follow-Up with El Segundo Unified School District',
    docType: 'Correspondence',
  },
  {
    file: 'ESUSD_Implementation_Plan.md',
    output: 'ESUSD_Implementation_Plan.pdf',
    title: 'SkaFld Trailhead',
    subtitle: 'ESUSD Partnership Implementation Plan',
    docType: 'Implementation Plan',
  },
];

(async () => {
  console.log('Generating SkaFld Trailhead ESUSD partnership PDFs...\n');
  if (LOGO_B64) console.log('  Logo loaded from:', LOGO_PATH);
  else console.log('  Warning: Logo not found, using text fallback');

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
  });

  for (const doc of DOCS) {
    const mdPath = path.join(PARTNERSHIP_DIR, doc.file);
    if (!fs.existsSync(mdPath)) {
      console.error(`  Skipping: ${doc.file} not found`);
      continue;
    }

    console.log(`  Processing ${doc.file}...`);
    const md = fs.readFileSync(mdPath, 'utf-8');
    const contentHtml = markdownToHtml(md);
    const fullHtml = buildHtml(doc.title, doc.subtitle, doc.docType, contentHtml);

    const page = await browser.newPage();
    await page.setContent(fullHtml);

    const outputPath = path.join(PARTNERSHIP_DIR, doc.output);
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      margin: MARGIN,
      displayHeaderFooter: true,
      headerTemplate: buildHeaderTemplate(doc.docType),
      footerTemplate: buildFooterTemplate(),
    });

    console.log(`  -> ${doc.output}`);
    await page.close();
  }

  await browser.close();
  console.log('\nDone! PDFs saved to correspondence/esusd-partnership/');
})();
