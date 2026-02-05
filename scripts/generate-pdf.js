const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 1920x1080 resolution
  const width = 1920;
  const height = 1080;

  // Set viewport to match slide dimensions
  await page.setViewportSize({ width, height });

  // Navigate to the pitch deck
  const url = 'http://localhost:3000/pitch';
  console.log(`Navigating to ${url}...`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Error connecting to localhost:3000. Make sure "npm start" is running!');
    await browser.close();
    process.exit(1);
  }

  // Force 'screen' media type to bypass @media print styles in custom.css
  await page.emulateMedia({ media: 'screen' });

  // Inject CSS to ensure perfect PDF rendering
  // We force body/html to be the exact size and hide UI elements
  await page.addStyleTag({
    content: `
      @page {
        size: ${width}px ${height}px;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        width: ${width}px;
        height: auto !important; /* Allow full height */
        overflow: visible !important; /* Show all content */
      }
      
      /* Un-fix the container so it flows vertically */
      .pitch-deck-container {
        position: relative !important;
        height: auto !important;
        overflow: visible !important;
        top: auto !important;
        left: auto !important;
      }

      /* Force pitch slides to fill the page */
      .pitch-slide {
        width: ${width}px !important;
        height: ${height}px !important;
        min-height: ${height}px !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box;
        page-break-after: always;
        page-break-inside: avoid;
        display: flex !important; /* Ensure flex layout is kept */
      }
      
      /* Ensure inner content is centered and scaled correctly if needed */
      .pitch-slide > * {
        max-width: 100%;
      }

      /* Hide UI controls */
      .navbar, .footer, .pitch-controls, .theme-doc-sidebar-container { 
        display: none !important; 
      }
      
      /* Force visibility of all animations */
      .animate-enter, .layer-card, .funding-segment, .chat-message { 
        opacity: 1 !important; 
        transform: none !important; 
        transition: none !important;
        animation: none !important;
      }
      
      /* Fix layout shifts */
      .main-wrapper { padding: 0 !important; margin: 0 !important; }
      article { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
    `
  });

  // Wait a moment for any final renders
  await page.waitForTimeout(3000);

  console.log('Generating PDF...');
  
  await page.pdf({
    path: path.join(__dirname, '../internal/ingestion/deck-export/AI_Studio_Teams_HighFidelity.pdf'),
    width: `${width}px`,
    height: `${height}px`,
    printBackground: true,
    pageRanges: '1-12' 
  });

  console.log('PDF generated successfully at internal/ingestion/deck-export/AI_Studio_Teams_HighFidelity.pdf');

  await browser.close();
})();