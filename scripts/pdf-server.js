const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/generate-pdf', async (req, res) => {
  console.log('Received request to generate PDF...');
  
  let browser;
  try {
    browser = await chromium.launch();
    
    // 3x Scale for Retina/High-Res Quality
    const width = 1920;
    const height = 1080;
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 3
    });
    
    const page = await context.newPage();
    
    // Navigate to the local Docusaurus instance
    // Assuming Docusaurus is running on port 3000
    const targetUrl = 'http://localhost:3000/pitch';
    console.log(`Navigating to ${targetUrl}...`);
    
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    // Inject CSS to clean up the page for capture
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

    // We need 'jspdf' to stitch the images
    const { jsPDF } = await import('jspdf');
    
    const pdfWidthMm = 338.67;
    const pdfHeightMm = 190.5;
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [pdfWidthMm, pdfHeightMm]
    });

    const slides = await page.$$('.pitch-slide');
    console.log(`Found ${slides.length} slides. Capturing...`);

    for (let i = 0; i < slides.length; i++) {
      // Capture element screenshot (PNG)
      const screenshotBuffer = await slides[i].screenshot({
        type: 'png',
        omitBackground: false
      });

      if (i > 0) doc.addPage();
      doc.addImage(screenshotBuffer, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'SLOW');
    }

    const pdfBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfBuffer);

    // Send the PDF back to the client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=AI_Studio_Teams_Presentation.pdf');
    res.send(buffer);
    
    console.log('PDF generated and sent successfully.');

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).send('Failed to generate PDF');
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`PDF Generation Server running on http://localhost:${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/generate-pdf`);
});
