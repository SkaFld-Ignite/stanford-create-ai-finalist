const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1920x1080 resolution
  const width = 1920;
  const height = 1080;

  // Navigate to the pitch deck
  // Assumes the server is running on port 3000
  const url = 'http://localhost:3000/pitch';
  console.log(`Navigating to ${url}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Error connecting to localhost:3000. Make sure "npm start" is running!');
    await browser.close();
    process.exit(1);
  }

  // Inject CSS to ensure perfect print rendering
  await page.addStyleTag({
    content: `
      @page {
        size: ${width}px ${height}px;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        background: #121212; /* Fallback */
      }
      .pitch-slide {
        width: ${width}px !important;
        height: ${height}px !important;
        page-break-after: always;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
        overflow: hidden;
      }
      /* Hide UI controls */
      .navbar, .footer, .pitch-controls { display: none !important; }
      
      /* Force visibility of all elements */
      .animate-enter { opacity: 1 !important; transform: none !important; }
    `
  });

  // Wait a moment for any final renders (e.g. images)
  await page.waitForTimeout(2000);

  console.log('Generating PDF...');
  
  await page.pdf({
    path: path.join(__dirname, '../internal/ingestion/deck-export/AI_Studio_Teams_HighFidelity.pdf'),
    width: `${width}px`,
    height: `${height}px`,
    printBackground: true,
    pageRanges: '1-12' // Ensure we capture all slides
  });

  console.log('PDF generated successfully at internal/ingestion/deck-export/AI_Studio_Teams_HighFidelity.pdf');

  await browser.close();
})();
