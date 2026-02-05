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
  // Simply downloads the pre-generated high-fidelity PDF from the static folder
  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/AI_Studio_Teams_Presentation.pdf'; // Path relative to static folder
    link.download = 'AI_Studio_Teams_Presentation.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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