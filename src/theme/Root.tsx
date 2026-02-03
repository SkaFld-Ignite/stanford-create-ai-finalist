import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

function Root({ children }) {
  const location = useLocation();
  const isPitchPage = location.pathname === '/pitch' || location.pathname === '/pitch/';

  useEffect(() => {
    // Only run on client and on pitch page
    if (typeof window === 'undefined' || !isPitchPage) {
      // Remove button if navigating away from pitch page
      const existingBtn = document.querySelector('.pitch-download-btn');
      if (existingBtn) {
        existingBtn.remove();
      }
      return;
    }

    // Insert the download button into the pitch deck
    const insertDownloadButton = () => {
      // Check if button already exists
      if (document.querySelector('.pitch-download-btn')) {
        return;
      }

      // Find the pitch deck container
      const pitchDeckContainer = document.querySelector('.pitch-deck-container');
      if (!pitchDeckContainer) {
        // Retry after a short delay if pitch deck isn't loaded yet
        setTimeout(insertDownloadButton, 200);
        return;
      }

      // Create the download button
      const button = document.createElement('button');
      button.className = 'pitch-download-btn';
      button.title = 'Download Pitch Deck as PDF';
      button.setAttribute('aria-label', 'Download Pitch Deck as PDF');
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Download PDF</span>
      `;

      button.addEventListener('click', handleDownload);

      // Insert at the beginning of the pitch deck container
      pitchDeckContainer.insertBefore(button, pitchDeckContainer.firstChild);
    };

    // Delay to ensure pitch deck is rendered
    const timer = setTimeout(insertDownloadButton, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [isPitchPage, location.pathname]);

  return <>{children}</>;
}

async function handleDownload() {
  // Dynamically import html2pdf to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;

  // Get the pitch deck container
  const container = document.querySelector('.pitch-deck-container');
  if (!container) {
    alert('Pitch deck not found. Please make sure you are on the Pitch Deck page.');
    return;
  }

  // Show loading state
  const btn = document.querySelector('.pitch-download-btn') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.classList.add('loading');
    const span = btn.querySelector('span');
    if (span) span.textContent = 'Generating...';
  }

  // Clone the container to avoid modifying the original
  const clone = container.cloneNode(true) as HTMLElement;

  // Remove the download button from the clone
  const cloneBtn = clone.querySelector('.pitch-download-btn');
  if (cloneBtn) cloneBtn.remove();

  // Remove the controller and any interactive elements
  clone.style.position = 'relative';
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.zIndex = '1';
  clone.style.width = '1920px';
  clone.style.background = 'white';

  // Force all slides to be visible and properly sized for PDF
  const slides = clone.querySelectorAll('.pitch-slide') as NodeListOf<HTMLElement>;
  slides.forEach((slide, index) => {
    slide.classList.add('in-view');
    slide.style.height = '1080px';
    slide.style.width = '1920px';
    slide.style.pageBreakAfter = 'always';
    slide.style.scrollSnapAlign = 'none';
    slide.style.opacity = '1';
    slide.style.position = 'relative';
    slide.style.display = 'flex';

    // Last slide shouldn't have page break
    if (index === slides.length - 1) {
      slide.style.pageBreakAfter = 'auto';
    }
  });

  // Force animations to complete
  const animatedElements = clone.querySelectorAll('.animate-enter') as NodeListOf<HTMLElement>;
  animatedElements.forEach((el) => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.animation = 'none';
    el.style.transition = 'none';
  });

  // Force layer cards to be expanded
  const layerCards = clone.querySelectorAll('.layer-card') as NodeListOf<HTMLElement>;
  layerCards.forEach((card) => {
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
    card.style.marginTop = '20px';
  });

  // Force funding segments to show their widths
  const fundingSegments = clone.querySelectorAll('.funding-segment') as NodeListOf<HTMLElement>;
  fundingSegments.forEach((seg) => {
    if (seg.classList.contains('fill-40')) seg.style.width = '40%';
    if (seg.classList.contains('fill-24')) seg.style.width = '24%';
    if (seg.classList.contains('fill-16')) seg.style.width = '16%';
    if (seg.classList.contains('fill-20')) seg.style.width = '20%';
  });

  // Force chat messages to be visible
  const chatMessages = clone.querySelectorAll('.chat-message') as NodeListOf<HTMLElement>;
  chatMessages.forEach((msg) => {
    msg.style.opacity = '1';
    msg.style.transform = 'scale(1)';
  });

  // Create a temporary container
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1920px';
  tempContainer.appendChild(clone);
  document.body.appendChild(tempContainer);

  const opt = {
    margin: 0,
    filename: 'AI-Studio-Teams-Pitch-Deck.pdf',
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      logging: false,
      letterRendering: true,
      width: 1920,
      height: 1080,
      windowWidth: 1920,
      windowHeight: 1080,
    },
    jsPDF: {
      unit: 'px',
      format: [1920, 1080] as [number, number],
      orientation: 'landscape' as const,
      hotfixes: ['px_scaling']
    },
    pagebreak: { mode: ['css', 'legacy'], before: '.pitch-slide' }
  };

  try {
    await html2pdf().set(opt).from(clone).save();
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try using your browser\'s print function (Ctrl/Cmd + P) and select "Save as PDF".');
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('loading');
      const span = btn.querySelector('span');
      if (span) span.textContent = 'Download PDF';
    }
  }
}

export default Root;
