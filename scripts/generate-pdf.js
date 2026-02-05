const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf');

(async () => {
  console.log('Starting Ultra-High-Fidelity PDF Generation...');
  const browser = await chromium.launch();
  
  // Use 3x scale factor for ultra-sharp results (5760x3240 effective resolution)
  const width = 1920;
  const height = 1080;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 3 
  });
  const page = await context.newPage();

  const url = 'http://localhost:3000/pitch';
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Error: Could not connect to http://localhost:3000. Is the server running?');
    await browser.close();
    process.exit(1);
  }

  // Stop animations and hide UI
  await page.addStyleTag({
    content: `
      body { overflow: visible !important; }
      .pitch-controls, .navbar, .footer { display: none !important; }
      .animate-enter, .layer-card, .funding-segment { 
        opacity: 1 !important; 
        transform: none !important; 
        transition: none !important; 
        animation: none !important;
      }
      .pitch-slide {
        margin: 0 !important;
        padding: 60px !important;
        height: 1080px !important;
        width: 1920px !important;
        position: relative !important;
      }
    `
  });

  const pdfWidthMm = 338.67;
  const pdfHeightMm = 190.5;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm]
  });

  const slides = await page.$$('.pitch-slide');
  console.log(`Found ${slides.length} slides.`);

  for (let i = 0; i < slides.length; i++) {
    console.log(`Processing slide ${i + 1}/${slides.length}...`);
    
    // Using element screenshot is more reliable for centering and scale
    const screenshotBuffer = await slides[i].screenshot({
      type: 'png',
      omitBackground: false
    });

    if (i > 0) doc.addPage();
    // Add image with no compression
    doc.addImage(screenshotBuffer, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'SLOW');
  }

  const outputPath = path.join(__dirname, '../internal/ingestion/deck-export/AI_Studio_Teams_HighFidelity.pdf');
  const pdfBuffer = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));

  console.log(`Success! Ultra-High-Fidelity PDF saved to: ${outputPath}`);
  await browser.close();
})();