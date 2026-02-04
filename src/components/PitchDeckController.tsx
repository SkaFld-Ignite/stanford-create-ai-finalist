import React, { useEffect, useRef, useState } from 'react';

const PitchDeckController = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    // 1. Setup Intersection Observer for Animations
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.5 // Trigger when 50% of slide is visible
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');

          // Update active index based on the slide's index
          const slides = document.querySelectorAll('.pitch-slide');
          const index = Array.from(slides).indexOf(entry.target);
          if (index !== -1) setActiveSlideIndex(index);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

    const slides = document.querySelectorAll('.pitch-slide');
    slides.forEach((slide) => {
      if (observerRef.current) observerRef.current.observe(slide);
    });

    // 2. Setup Keyboard Navigation
    const handleKeyDown = (e) => {
      const slides = document.querySelectorAll('.pitch-slide');
      if (!slides.length) return;

      let currentSlideIndex = -1;
      let minDistance = Infinity;

      slides.forEach((slide, index) => {
        const rect = slide.getBoundingClientRect();
        const distance = Math.abs(rect.top);
        if (distance < minDistance) {
          minDistance = distance;
          currentSlideIndex = index;
        }
      });

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
          slides[currentSlideIndex + 1].scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSlideIndex > 0) {
          slides[currentSlideIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Presentation Mode & Download Logic
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Toggle Presentation Mode
  const togglePresentationMode = () => {
    const nextState = !isPresentationMode;
    setIsPresentationMode(nextState);

    if (nextState) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.warn(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresentationMode) {
        setIsPresentationMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isPresentationMode]);

  useEffect(() => {
    if (isPresentationMode) {
      document.body.classList.add('presentation-mode-active');
    } else {
      document.body.classList.remove('presentation-mode-active');
    }
  }, [isPresentationMode]);

  // Handle PDF Download
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const slides = document.querySelectorAll('.pitch-slide');
      if (!slides.length) return;

      // Force 1920x1080 resolution for capture
      const slideWidth = 1920;
      const slideHeight = 1080;

      // PDF dimensions in mm (16:9 ratio)
      const pdfWidthMm = 338.67;
      const pdfHeightMm = 190.5;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidthMm, pdfHeightMm],
        compress: true
      });

      // Offscreen container to render slides at exact target dimensions
      const offscreenContainer = document.createElement('div');
      offscreenContainer.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: ${slideWidth}px;
        height: ${slideHeight}px;
        z-index: 99999;
        overflow: hidden;
      `;
      document.body.appendChild(offscreenContainer);

      for (let i = 0; i < slides.length; i++) {
        const originalSlide = slides[i];
        const slideClone = originalSlide.cloneNode(true);

        const computedStyle = window.getComputedStyle(originalSlide);
        const originalBg = computedStyle.background;
        const originalBgColor = computedStyle.backgroundColor;

        // Apply exact dimensions and styling for PDF capture
        slideClone.style.cssText = `
          width: ${slideWidth}px !important;
          height: ${slideHeight}px !important;
          min-height: ${slideHeight}px !important;
          max-height: ${slideHeight}px !important;
          padding: 60px !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          overflow: hidden !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          background: ${originalBg || originalBgColor} !important;
        `;

        // Force animations to complete state
        slideClone.classList.add('in-view');
        slideClone.querySelectorAll('.animate-enter, .layer-card, .funding-segment, .chat-message, [class*="animate"]').forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.transition = 'none';
          el.style.animation = 'none';
        });

        // FIX: Image Distortion
        // Specifically target images to ensure they don't stretch
        slideClone.querySelectorAll('img').forEach((img) => {
          // If it's an avatar/headshot or general image
          img.style.objectFit = 'cover';
          
          // If it is inside an avatar-circle, force fill
          if (img.closest('.avatar-circle')) {
             img.style.width = '100%';
             img.style.height = '100%';
          }
        });

        // Force funding segment widths if they are percentage based
        slideClone.querySelectorAll('.funding-segment.fill-40').forEach(el => el.style.width = '40%');
        slideClone.querySelectorAll('.funding-segment.fill-24').forEach(el => el.style.width = '24%');
        slideClone.querySelectorAll('.funding-segment.fill-16').forEach(el => el.style.width = '16%');
        slideClone.querySelectorAll('.funding-segment.fill-20').forEach(el => el.style.width = '20%');

        // Remove controls
        slideClone.querySelectorAll('.pitch-controls, .control-btn').forEach((el) => el.remove());

        offscreenContainer.innerHTML = '';
        offscreenContainer.appendChild(slideClone);

        // Wait for render stability
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Use windowWidth/windowHeight to ensure relative units (vw/vh) resolve to our fixed dimensions
        const canvas = await html2canvas(slideClone, {
          width: slideWidth,
          height: slideHeight,
          windowWidth: slideWidth,
          windowHeight: slideHeight,
          scale: 2, // 2x scale for crisp text on PDF
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          scrollX: 0,
          scrollY: 0
        });

        if (i > 0) pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm);
      }

      document.body.removeChild(offscreenContainer);
      pdf.save('AI_Studio_Teams_Presentation.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF Generation failed. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="pitch-controls">
      <button
        onClick={togglePresentationMode}
        className="control-btn"
        title={isPresentationMode ? "Exit Presentation Mode" : "Enter Presentation Mode"}
      >
        {isPresentationMode ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        )}
      </button>

      <button
        onClick={handleDownloadPDF}
        className="control-btn"
        title={isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        disabled={isGeneratingPDF}
        style={{ opacity: isGeneratingPDF ? 0.6 : 1 }}
      >
        {isGeneratingPDF ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
      </button>

    </div>
  );
};

export default PitchDeckController;