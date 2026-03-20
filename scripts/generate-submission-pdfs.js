const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BRAND = {
  cardinal: '#8C1515',
  cardinalDark: '#5f0e0e',
  dark: '#1a1a1a',
  gray: '#666',
  lightGray: '#f8f9fa',
  border: '#e0e0e0',
};

const LOGO_SVG = `<svg width="32" height="32" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="19" fill="${BRAND.cardinal}" stroke="${BRAND.cardinalDark}" stroke-width="1"/>
  <circle cx="20" cy="8" r="3" fill="white"/>
  <circle cx="10" cy="20" r="3" fill="white"/>
  <circle cx="20" cy="20" r="4" fill="white"/>
  <circle cx="30" cy="20" r="3" fill="white"/>
  <circle cx="12" cy="32" r="3" fill="white"/>
  <circle cx="28" cy="32" r="3" fill="white"/>
  <line x1="20" y1="11" x2="10" y2="17" stroke="white" stroke-width="1.5" stroke-opacity="0.7"/>
  <line x1="20" y1="11" x2="20" y2="16" stroke="white" stroke-width="1.5" stroke-opacity="0.7"/>
  <line x1="20" y1="11" x2="30" y2="17" stroke="white" stroke-width="1.5" stroke-opacity="0.7"/>
  <line x1="10" y1="23" x2="12" y2="29" stroke="white" stroke-width="1.5" stroke-opacity="0.7"/>
  <line x1="20" y1="24" x2="12" y2="29" stroke="white" stroke-width="1.5" stroke-opacity="0.7"/>
  <line x1="20" y1="24" x2="28" y2="29" stroke="white" stroke-width="1.5" stroke-opacity="0.7"/>
  <line x1="30" y1="23" x2="28" y2="29" stroke="white" stroke-width="1.5" stroke-opacity="0.7"/>
  <line x1="10" y1="23" x2="20" y2="24" stroke="white" stroke-width="1" stroke-opacity="0.5"/>
  <line x1="20" y1="24" x2="30" y2="23" stroke="white" stroke-width="1" stroke-opacity="0.5"/>
</svg>`;

function markdownToHtml(md) {
  // Remove frontmatter
  md = md.replace(/^---[\s\S]*?---\n*/m, '');

  const lines = md.split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // --- Tables: detect header | sep | body ---
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const headerLine = line;
      i += 2; // skip header + separator
      const bodyLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        bodyLines.push(lines[i]);
        i++;
      }
      const parseCells = (row) => row.split('|').slice(1, -1).map(c => c.trim());
      const thCells = parseCells(headerLine).map(c => `<th>${inlineFormat(c)}</th>`).join('');
      const rows = bodyLines.map(row => {
        const cells = parseCells(row).map(c => `<td>${inlineFormat(c)}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      out.push(`<table><thead><tr>${thCells}</tr></thead><tbody>${rows}</tbody></table>`);
      continue;
    }

    // --- Headers ---
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      out.push(`<h${level}>${inlineFormat(hMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // --- Horizontal rule ---
    if (/^---+$/.test(line.trim())) {
      out.push('<hr/>');
      i++;
      continue;
    }

    // --- Unordered list block ---
    if (/^\s*- /.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*- /.test(lines[i])) {
        // Gather continuation lines (indented, not a new list item)
        let itemText = lines[i].replace(/^\s*- /, '');
        i++;
        while (i < lines.length && /^\s{2,}[^-]/.test(lines[i]) && lines[i].trim() !== '') {
          itemText += ' ' + lines[i].trim();
          i++;
        }
        items.push(`<li>${inlineFormat(itemText)}</li>`);
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // --- Blockquote ---
    if (line.startsWith('> ')) {
      out.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      i++;
      continue;
    }

    // --- Blank line ---
    if (line.trim() === '') {
      i++;
      continue;
    }

    // --- Paragraph: accumulate consecutive non-empty, non-special lines ---
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('- ') && !lines[i].trim().startsWith('> ') &&
      !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      out.push(`<p>${inlineFormat(paraLines.join(' '))}</p>`);
    }
  }

  return out.join('\n');
}

function inlineFormat(text) {
  // Bold + italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Notes in brackets
  text = text.replace(/\[([A-Z][A-Z\s:—,.]+?)\]/g, '<span class="note">[$1]</span>');
  return text;
}

function buildPage(title, subtitle, contentHtml, docType) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: letter;
    margin: 0;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: ${BRAND.dark};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Cover header band */
  .cover-header {
    background: ${BRAND.cardinal};
    color: white;
    padding: 36px 54px 28px;
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }
  .cover-header .logo { flex-shrink: 0; margin-top: 2px; }
  .cover-header .titles { flex: 1; }
  .cover-header h1 {
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 4px;
    line-height: 1.2;
  }
  .cover-header .subtitle {
    font-size: 11pt;
    font-weight: 400;
    opacity: 0.85;
    margin-bottom: 2px;
  }
  .cover-header .doc-type {
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.65;
    margin-top: 6px;
  }
  .cover-header .meta {
    text-align: right;
    font-size: 8.5pt;
    opacity: 0.75;
    line-height: 1.6;
    white-space: nowrap;
  }

  /* Accent bar */
  .accent-bar {
    height: 3px;
    background: linear-gradient(90deg, ${BRAND.cardinal}, ${BRAND.cardinalDark});
  }

  /* Content area */
  .content {
    padding: 28px 54px 40px;
  }

  h1 { font-size: 18pt; color: ${BRAND.cardinal}; margin: 24px 0 10px; font-weight: 700; }
  h2 { font-size: 14pt; color: ${BRAND.cardinal}; margin: 22px 0 8px; font-weight: 700; border-bottom: 2px solid ${BRAND.cardinal}; padding-bottom: 4px; }
  h3 { font-size: 11.5pt; color: ${BRAND.dark}; margin: 16px 0 6px; font-weight: 700; }
  h4 { font-size: 10.5pt; color: ${BRAND.gray}; margin: 12px 0 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
  /* Hide the duplicate top-level heading that comes from the markdown */
  .content > h1:first-child { display: none; }
  .content > h2:first-child { margin-top: 0; }

  p { margin: 6px 0; }

  ul { margin: 6px 0 6px 20px; }
  li { margin: 3px 0; }

  strong { font-weight: 700; }

  code {
    background: ${BRAND.lightGray};
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 9.5pt;
    font-family: 'SF Mono', 'Consolas', monospace;
  }

  blockquote {
    border-left: 3px solid ${BRAND.cardinal};
    padding: 8px 16px;
    margin: 10px 0;
    color: ${BRAND.gray};
    font-style: italic;
    background: ${BRAND.lightGray};
    border-radius: 0 6px 6px 0;
  }

  hr {
    border: none;
    border-top: 1px solid ${BRAND.border};
    margin: 20px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 10pt;
  }
  thead tr {
    background: ${BRAND.cardinal};
    color: white;
  }
  th {
    padding: 8px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 9.5pt;
  }
  td {
    padding: 7px 12px;
    border-bottom: 1px solid ${BRAND.border};
  }
  tbody tr:nth-child(even) {
    background: ${BRAND.lightGray};
  }
  tbody tr:last-child td {
    font-weight: 600;
  }

  .note {
    color: ${BRAND.cardinal};
    font-style: italic;
    font-weight: 600;
  }

  /* Footer */
  .page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 54px;
    font-size: 7.5pt;
    color: ${BRAND.gray};
    display: flex;
    justify-content: space-between;
    border-top: 1px solid ${BRAND.border};
    background: white;
  }
</style>
</head>
<body>
  <div class="cover-header">
    <div class="logo">${LOGO_SVG}</div>
    <div class="titles">
      <h1>${title}</h1>
      <div class="subtitle">${subtitle}</div>
      <div class="doc-type">${docType}</div>
    </div>
    <div class="meta">
      SkaFld Studio LLC<br>
      889 N Douglas St, Ste 201<br>
      El Segundo, CA 90245<br>
      <br>
      PI: Keith Coleman<br>
      Period: 03/01/2026 – 02/28/2027
    </div>
  </div>
  <div class="accent-bar"></div>
  <div class="content">
    ${contentHtml}
  </div>
  <div class="page-footer">
    <span>AI Studio Teams — Stanford CREATE+AI Challenge — SkaFld Studio LLC</span>
    <span>Confidential</span>
  </div>
</body>
</html>`;
}

const DOCS = [
  {
    file: 'Statement_of_Work.md',
    output: 'AI_Studio_Teams_Statement_of_Work.pdf',
    title: 'AI Studio Teams',
    subtitle: 'Stanford CREATE+AI Challenge — Track 3: Augment Career Opportunities',
    docType: 'Statement of Work',
  },
  {
    file: 'Detailed_Budget.md',
    output: 'AI_Studio_Teams_Detailed_Budget.pdf',
    title: 'AI Studio Teams',
    subtitle: 'Stanford CREATE+AI Challenge — Track 3: Augment Career Opportunities',
    docType: 'Detailed Budget',
  },
  {
    file: 'Budget_Justification.md',
    output: 'AI_Studio_Teams_Budget_Justification.pdf',
    title: 'AI Studio Teams',
    subtitle: 'Stanford CREATE+AI Challenge — Track 3: Augment Career Opportunities',
    docType: 'Budget Justification',
  },
];

(async () => {
  console.log('Generating branded submission PDFs...\n');

  const browser = await chromium.launch();
  const inputDir = path.join(__dirname, '../internal/ingestion/ai-studio-teams-submission');
  const outputDir = inputDir;

  for (const doc of DOCS) {
    const mdPath = path.join(inputDir, doc.file);
    if (!fs.existsSync(mdPath)) {
      console.error(`  Skipping: ${doc.file} not found`);
      continue;
    }

    console.log(`  Processing ${doc.file}...`);
    const md = fs.readFileSync(mdPath, 'utf-8');
    const contentHtml = markdownToHtml(md);
    const fullHtml = buildPage(doc.title, doc.subtitle, contentHtml, doc.docType);

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle' });

    const outputPath = path.join(outputDir, doc.output);
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '40px', left: '0' },
      displayHeaderFooter: false,
    });

    console.log(`  -> ${doc.output}`);
    await page.close();
  }

  await browser.close();
  console.log('\nDone! PDFs saved to internal/ingestion/ai-studio-teams-submission/');
})();
