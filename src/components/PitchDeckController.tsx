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

  // Calculate progress percentage
  const totalSlides = typeof document !== 'undefined' ? document.querySelectorAll('.pitch-slide').length : 12; // default to 12 if SSR
  const progress = ((activeSlideIndex + 1) / totalSlides) * 100;

  return (
    <div className="pitch-controls">
      {/* Progress Bar */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          height: '6px',
          backgroundColor: '#8C1515',
          width: `${progress}%`,
          transition: 'width 0.3s ease',
          zIndex: 3000
        }}
      />
      
      {/* Navigation Hint (fades out after a few seconds? - keeping simple for now) */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 3000,
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(5px)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        color: '#888',
        pointerEvents: 'none',
        opacity: activeSlideIndex === 0 ? 1 : 0.3,
        transition: 'opacity 0.5s'
      }}>
        Use Arrow Keys or Space to Navigate
      </div>
    </div>
  );
};

export default PitchDeckController;
