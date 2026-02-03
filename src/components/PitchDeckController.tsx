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

      // Get all slides
      const originalSlides = document.querySelectorAll('.pitch-slide');
      if (!originalSlides.length) return;

      // 16:9 aspect ratio for presentation decks
      // Using 1280x720 as base (standard 720p), scaled up for quality
      const slideWidth = 1280;
      const slideHeight = 720;

      // PDF dimensions in mm (16:9 ratio)
      // A4 landscape is 297x210mm, but we'll use custom 16:9 dimensions
      const pdfWidthMm = 338.67; // ~13.33 inches = 720p aspect at good print size
      const pdfHeightMm = 190.5; // 338.67 / 16 * 9

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidthMm, pdfHeightMm],
        compress: true
      });

      // Process each slide individually
      for (let i = 0; i < originalSlides.length; i++) {
        const originalSlide = originalSlides[i] as HTMLElement;

        // Create a temporary container for this slide
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = `${slideWidth}px`;
        container.style.height = `${slideHeight}px`;
        container.style.zIndex = '-9999';
        container.style.overflow = 'hidden';
        container.style.visibility = 'hidden';

        // Clone the slide
        const slideClone = originalSlide.cloneNode(true) as HTMLElement;

        // Get original background
        const originalBg = window.getComputedStyle(originalSlide).background;
        const originalBgColor = window.getComputedStyle(originalSlide).backgroundColor;

        // Apply PDF-specific styles to the clone
        slideClone.style.width = `${slideWidth}px`;
        slideClone.style.height = `${slideHeight}px`;
        slideClone.style.minHeight = `${slideHeight}px`;
        slideClone.style.maxHeight = `${slideHeight}px`;
        slideClone.style.overflow = 'hidden';
        slideClone.style.opacity = '1';
        slideClone.style.transform = 'none';
        slideClone.style.position = 'relative';
        slideClone.style.display = 'flex';
        slideClone.style.flexDirection = 'column';
        slideClone.style.justifyContent = 'center';
        slideClone.style.alignItems = 'center';
        slideClone.style.padding = '40px';
        slideClone.style.boxSizing = 'border-box';
        slideClone.style.scrollSnapAlign = 'none';
        slideClone.style.background = originalBg || originalBgColor;

        // Scale typography for PDF - using viewport-relative to fixed conversion
        // Original viewport is ~1920px wide, we're rendering at 1280px (0.67x)
        const scaleFactor = 0.65;

        slideClone.querySelectorAll('h1').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.fontSize = `${4.5 * scaleFactor}rem`;
          htmlEl.style.marginBottom = '0.75rem';
          htmlEl.style.lineHeight = '1.1';
        });

        slideClone.querySelectorAll('h2').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.fontSize = `${2 * scaleFactor}rem`;
          htmlEl.style.marginBottom = '1rem';
        });

        slideClone.querySelectorAll('h3').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.fontSize = `${1.5 * scaleFactor}rem`;
        });

        slideClone.querySelectorAll('p').forEach((el) => {
          const htmlEl = el as HTMLElement;
          const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
          htmlEl.style.fontSize = `${Math.max(currentSize * scaleFactor, 12)}px`;
          htmlEl.style.lineHeight = '1.4';
        });

        // Scale metric values and labels
        slideClone.querySelectorAll('.metric-val').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.fontSize = `${4 * scaleFactor}rem`;
        });

        slideClone.querySelectorAll('.metric-label').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.fontSize = `${1.1 * scaleFactor}rem`;
        });

        // Scale metric grid gaps
        slideClone.querySelectorAll('.metric-grid').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.gap = '1rem';
          htmlEl.style.marginTop = '1.5rem';
        });

        // Scale metric cards
        slideClone.querySelectorAll('.metric-card').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.padding = '1.5rem 1rem';
        });

        // Scale split layout gaps
        slideClone.querySelectorAll('.split-layout').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.gap = '2rem';
        });

        // Scale layer cards
        slideClone.querySelectorAll('.layer-card').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.width = '500px';
          htmlEl.style.padding = '1rem';
          htmlEl.style.gap = '1rem';
        });

        // Scale layer stack
        slideClone.querySelectorAll('.layer-stack').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.marginTop = '1rem';
        });

        // Scale chat window
        slideClone.querySelectorAll('.chat-window').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.maxWidth = '550px';
        });

        slideClone.querySelectorAll('.chat-body').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.minHeight = '280px';
          htmlEl.style.padding = '1.5rem';
        });

        slideClone.querySelectorAll('.chat-message').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.fontSize = '1rem';
          htmlEl.style.padding = '0.8rem 1.2rem';
        });

        // Scale highlight boxes
        slideClone.querySelectorAll('.highlight-box').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.padding = '1.5rem';
        });

        // Scale avatar circles
        slideClone.querySelectorAll('.avatar-circle').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.width = '80px';
          htmlEl.style.height = '80px';
          htmlEl.style.marginBottom = '1rem';
        });

        // Scale footer
        slideClone.querySelectorAll('.pitch-footer').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.bottom = '15px';
          htmlEl.style.padding = '0 2rem';
        });

        slideClone.querySelectorAll('.pitch-footer-text').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.fontSize = '0.7rem';
        });

        // Scale slide number
        slideClone.querySelectorAll('.slide-number').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.bottom = '10px';
          htmlEl.style.right = '15px';
          htmlEl.style.fontSize = '0.7rem';
        });

        // Scale logo corner
        slideClone.querySelectorAll('.logo-corner').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.top = '20px';
          htmlEl.style.right = '20px';
          htmlEl.style.height = '40px';
        });

        // Ensure all animated elements are visible
        slideClone.querySelectorAll('.animate-enter, [class*="animate"], .split-col, .layer-card, .funding-segment').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.opacity = '1';
          htmlEl.style.transform = 'none';
          htmlEl.style.transition = 'none';
          htmlEl.style.animation = 'none';
        });
        slideClone.classList.add('in-view');

        // Force funding bar segment widths
        slideClone.querySelectorAll('.funding-segment.fill-40').forEach((el) => {
          (el as HTMLElement).style.width = '40%';
        });
        slideClone.querySelectorAll('.funding-segment.fill-24').forEach((el) => {
          (el as HTMLElement).style.width = '24%';
        });
        slideClone.querySelectorAll('.funding-segment.fill-16').forEach((el) => {
          (el as HTMLElement).style.width = '16%';
        });
        slideClone.querySelectorAll('.funding-segment.fill-20').forEach((el) => {
          (el as HTMLElement).style.width = '20%';
        });

        // Remove UI controls that shouldn't appear in PDF
        slideClone.querySelectorAll('.pitch-controls, .control-btn').forEach((el) => el.remove());

        container.appendChild(slideClone);
        document.body.appendChild(container);

        // Make visible for rendering
        container.style.visibility = 'visible';

        // Wait for fonts and images to load
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Determine background color for canvas
        let bgColor = '#ffffff';
        if (originalSlide.classList.contains('slide-dark')) {
          bgColor = '#121212';
        } else if (originalSlide.classList.contains('slide-brand')) {
          bgColor = '#8C1515';
        } else if (originalSlide.classList.contains('slide-gradient')) {
          bgColor = '#fdfbfb';
        }

        // Capture the slide as canvas
        const canvas = await html2canvas(container, {
          width: slideWidth,
          height: slideHeight,
          scale: 2, // 2x for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgColor,
          logging: false
        });

        // Add page (except for first slide)
        if (i > 0) {
          pdf.addPage();
        }

        // Add the canvas image to PDF (full page)
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm);

        // Cleanup
        document.body.removeChild(container);
      }

      // Save the PDF
      pdf.save('AI Studio Teams Deck.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
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
