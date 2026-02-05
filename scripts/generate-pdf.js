const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { jsPDF } = require('jspdf'); // Requires 'jspdf' in package.json

(async () => {
  console.log('Starting High-Fidelity PDF Generation...');
  const browser = await chromium.launch();
  // Set deviceScaleFactor to 2 for Retina-quality screenshots (3840x2160 effective pixels)
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  // 1. Setup - Exact 16:9 Slide Dimensions
  const width = 1920;
  const height = 1080;
  // Viewport already set in newContext, but ensuring variables are kept for logic
  
  // 2. Navigate
  const url = 'http://localhost:3000/pitch';
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Error: Could not connect to http://localhost:3000. Is the server running?');
    await browser.close();
    process.exit(1);
  }

  // 3. Prepare Page (Hide UI, stop animations)
  await page.addStyleTag({
    content: `
      body { overflow: hidden !important; }
      .pitch-controls, .navbar, .footer { display: none !important; }
      .animate-enter, .layer-card, .funding-segment { 
        opacity: 1 !important; 
        transform: none !important; 
        transition: none !important; 
        animation: none !important;
      }
      /* Ensure text rendering is consistent */
      body { -webkit-font-smoothing: antialiased; }
    `
  });

  // 4. Initialize PDF
  // A4 Landscape is approx 297mm x 210mm. 
  // 16:9 ratio fits well on screen but PDF usually uses mm.
  // We will create a PDF with custom dimensions matching the 16:9 ratio to ensure full bleed.
  // 1920px / 96dpi * 25.4 = ~508mm. Let's just map pixels to points or match ratio.
  // We'll use the exact mm dimensions for 16:9 aspect ratio: 338.67mm x 190.5mm (used in controller)
  const pdfWidthMm = 338.67;
  const pdfHeightMm = 190.5;
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm] // Custom 16:9 format
  });

  // 5. Capture Slides
  const slides = await page.$$('.pitch-slide');
  console.log(`Found ${slides.length} slides.`);

  for (let i = 0; i < slides.length; i++) {
    console.log(`Processing slide ${i + 1}/${slides.length}...`);
    
    // Scroll to slide
    await slides[i].scrollIntoViewIfNeeded();
    
    // Wait for any lazy loads or repaints
    await page.waitForTimeout(500);

    // Capture high-res screenshot
    const screenshotBuffer = await page.screenshot({
      type: 'png', // PNG is sharper for text than JPEG
      clip: { x: 0, y: 0, width, height }
    });

    // Add to PDF
    if (i > 0) doc.addPage();
    // 'PNG' format, 0 compression (lossless)
    doc.addImage(screenshotBuffer, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm);
  }

  // 6. Save
  const outputPath = path.join(__dirname, '../internal/ingestion/deck-export/AI_Studio_Teams_HighFidelity.pdf');
  const pdfBuffer = doc.output('arraybuffer');
  fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));

  console.log(`Success! PDF saved to: ${outputPath}`);
  await browser.close();
})();
