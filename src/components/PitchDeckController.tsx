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
        } else {
          // Optional: Remove class to re-animate when scrolling back up
          // entry.target.classList.remove('in-view'); 
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

      // Find current scroll position to determine roughly where we are
      // (State might be slightly desynced if user scrolled manually)
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
      // Enter Fullscreen directly on click
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      // Exit Fullscreen directly on click
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.warn(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  // Sync state if user exits fullscreen via Esc key
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPresentationMode) {
        setIsPresentationMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isPresentationMode]);

  // Handle CSS class toggle side effect
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
      // Dynamically import libraries
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Get deck container and all slides
      const deckContainer = document.querySelector('.pitch-deck-container') as HTMLElement;
      const slides = document.querySelectorAll('.pitch-slide');
      if (!slides.length || !deckContainer) return;

      // PDF dimensions - 16:9 aspect ratio in mm (standard widescreen)
      const pdfWidthMm = 338.67;
      const pdfHeightMm = 190.5;

      // Capture dimensions (16:9)
      const captureWidth = 1920;
      const captureHeight = 1080;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidthMm, pdfHeightMm],
        compress: true
      });

      // Enter presentation mode to get clean slides
      document.body.classList.add('presentation-mode-active');

      // Hide controls during capture
      const controls = document.querySelector('.pitch-controls') as HTMLElement;
      if (controls) controls.style.display = 'none';

      // Store original scroll position
      const originalScrollTop = deckContainer.scrollTop;

      // Ensure all slides have in-view class for animations
      slides.forEach((slide) => {
        slide.classList.add('in-view');
        // Force all animated elements visible
        slide.querySelectorAll('.animate-enter, .layer-card, .funding-segment, .chat-message').forEach((el) => {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'none';
        });
      });

      // Force funding segment widths
      document.querySelectorAll('.funding-segment.fill-40').forEach((el) => {
        (el as HTMLElement).style.width = '40%';
      });
      document.querySelectorAll('.funding-segment.fill-24').forEach((el) => {
        (el as HTMLElement).style.width = '24%';
      });
      document.querySelectorAll('.funding-segment.fill-16').forEach((el) => {
        (el as HTMLElement).style.width = '16%';
      });
      document.querySelectorAll('.funding-segment.fill-20').forEach((el) => {
        (el as HTMLElement).style.width = '20%';
      });

      // Wait a moment for presentation mode and styles to apply
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture each slide
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i] as HTMLElement;

        // Scroll to this slide (instant, no animation)
        slide.scrollIntoView({ behavior: 'auto', block: 'start' });

        // Wait for scroll and render to complete
        await new Promise((resolve) => setTimeout(resolve, 250));

        // Get computed background
        const computedStyle = window.getComputedStyle(slide);
        let bgColor: string | null = computedStyle.backgroundColor;

        // For gradient slides, we need to let html2canvas capture the gradient
        if (slide.classList.contains('slide-gradient')) {
          bgColor = null;
        }

        // Capture the slide
        const canvas = await html2canvas(slide, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgColor,
          logging: false,
          width: captureWidth,
          height: captureHeight,
          windowWidth: captureWidth,
          windowHeight: captureHeight,
          x: 0,
          y: 0
        });

        // Add page (except for first slide)
        if (i > 0) {
          pdf.addPage();
        }

        // Add the canvas image to PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm);
      }

      // Restore original scroll position
      deckContainer.scrollTop = originalScrollTop;

      // Exit presentation mode
      document.body.classList.remove('presentation-mode-active');

      // Show controls again
      if (controls) controls.style.display = '';

      // Save the PDF
      pdf.save('AI Studio Teams Deck.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Make sure to exit presentation mode even on error
      document.body.classList.remove('presentation-mode-active');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate progress percentage
  const totalSlides = typeof document !== 'undefined' ? document.querySelectorAll('.pitch-slide').length : 12; // default to 12 if SSR
  const progress = ((activeSlideIndex + 1) / totalSlides) * 100;

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
