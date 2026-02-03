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
  const handleDownloadPDF = async () => {
    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;

    // 1. Get original element
    const original = document.querySelector('.pitch-deck-container');
    if (!original) return;

    // 2. Clone it to avoid messing with the live view
    const clone = original.cloneNode(true) as HTMLElement;

    // 3. Create a temporary container off-screen
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.background = '#ffffff';
    container.style.visibility = 'visible';
    container.style.left = '0';
    container.style.width = '1600px'; // Enforce context width
    container.appendChild(clone);
    document.body.appendChild(container);

    // 4. Sanitize the clone's styles for perfect PDF capture
    clone.style.width = '1600px';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.scrollSnapType = 'none';
    clone.style.position = 'static';
    clone.style.transform = 'none';

    // Enforce slide dimensions and visibility
    const slides = clone.querySelectorAll('.pitch-slide');
    slides.forEach((slide: any) => {
      slide.style.width = '1600px';
      slide.style.height = '900px'; // Strict 16:9
      slide.style.minHeight = '900px';
      slide.style.opacity = '1';
      slide.style.transform = 'none';
      slide.style.display = 'flex'; // Maintain layout
      slide.style.pageBreakAfter = 'always';

      // Ensure specific internal layouts (split columns) are visible
      const splitCols = slide.querySelectorAll('.split-col');
      splitCols.forEach((col: any) => {
        col.style.opacity = '1';
        col.style.transform = 'none';
      });
    });

    // Force all animations to their final "entered" state
    const animated = clone.querySelectorAll('.animate-enter');
    animated.forEach((el: any) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
      el.style.animation = 'none';
      el.classList.add('in-view');
    });

    // 5. Generate PDF
    const opt = {
      margin: 0,
      filename: 'AI Studio Teams Deck.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        windowWidth: 1600,
        windowHeight: 900
      },
      jsPDF: { unit: 'in', format: [16, 9], orientation: 'landscape', compress: true }
    } as const;

    // 6. Save and Cleanup
    (html2pdf() as any).set(opt).from(clone).save().then(() => {
      document.body.removeChild(container);
    });
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
        title="Download PDF"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>

    </div>
  );
};

export default PitchDeckController;
