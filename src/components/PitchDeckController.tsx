import React, { useEffect, useRef, useState } from 'react';

const PitchDeckController = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const [scale, setScale] = useState(1);
  const observerRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slides = document.querySelectorAll('.pitch-slide');
    setTotalSlides(slides.length);

    // Dynamic Scaling Logic
    const updateScale = () => {
      const container = document.querySelector('.pitch-deck-container');
      if (container) {
        const width = container.clientWidth;
        // Base scale on a standard 1920px width
        const newScale = width / 1920;
        setScale(newScale);
        document.documentElement.style.setProperty('--pitch-scale', newScale.toString());
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    const container = document.querySelector('.pitch-deck-container');
    if (container) resizeObserver.observe(container);
    updateScale();

    // Inject/Update dynamic slide numbers for each slide
    slides.forEach((slide, index) => {
      let numDiv = slide.querySelector('.slide-number');
      if (!numDiv) {
        numDiv = document.createElement('div');
        numDiv.className = 'slide-number';
        slide.appendChild(numDiv);
      }
      numDiv.textContent = (index + 1).toString();
    });

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

          const slides = document.querySelectorAll('.pitch-slide');
          const index = Array.from(slides).indexOf(entry.target);
          if (index !== -1) {
            setActiveSlideIndex(index);
            // Notify parent window (for pitch-internal synchronization)
            if (window.parent !== window) {
              window.parent.postMessage({ type: 'SLIDE_CHANGE', index }, '*');
            }
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

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

    // 3. Listen for message from parent (pitch-internal control)
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'GOTO_SLIDE') {
        const index = event.data.index;
        const slides = document.querySelectorAll('.pitch-slide');
        if (slides[index]) {
          slides[index].scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Presentation Mode
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

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

  const toggleEditable = () => {
    const nextState = !isEditable;
    setIsEditable(nextState);
    
    const slides = document.querySelectorAll('.pitch-slide');
    slides.forEach((slide) => {
      // We target common text elements to make them editable
      // or just the whole slide for maximum flexibility
      if (nextState) {
        slide.setAttribute('contenteditable', 'true');
        (slide as HTMLElement).style.cursor = 'text';
      } else {
        slide.removeAttribute('contenteditable');
        (slide as HTMLElement).style.cursor = '';
      }
    });
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

  // Handle PDF Download (High-Fidelity Client-Side)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const slides = document.querySelectorAll('.pitch-slide');
      if (!slides.length) return;

      // Exact 16:9 dimensions matching fullscreen display
      const slideWidth = 1920;
      const slideHeight = 1080;
      const pdfWidthMm = 338.67;
      const pdfHeightMm = 190.5;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidthMm, pdfHeightMm],
        compress: true
      });

      // Create a dedicated rendering container sized exactly like fullscreen
      const renderContainer = document.createElement('div');
      renderContainer.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: ${slideWidth}px;
        height: ${slideHeight}px;
        z-index: 99999;
        overflow: hidden;
        background: #fff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      `;
      document.body.appendChild(renderContainer);

      // Helper: copy only typography/visual computed styles (NOT layout/sizing)
      // Layout properties (width, height, position, flex, grid, etc.) must resolve
      // naturally from CSS classes in the 1920px container, not be frozen from the
      // user's viewport size which would break centering and alignment.
      const copyComputedStyles = (source: Element, target: HTMLElement) => {
        const computed = window.getComputedStyle(source);
        const props = [
          'font-size', 'font-weight', 'font-family', 'line-height', 'letter-spacing',
          'text-align', 'text-transform', 'color',
          'background', 'background-color', 'background-image',
          'border', 'border-radius', 'border-left', 'border-top',
          'border-right', 'border-bottom', 'box-shadow',
          'white-space', 'word-break', 'text-decoration',
          'opacity', 'list-style', 'list-style-type',
        ];
        props.forEach(prop => {
          try {
            const val = computed.getPropertyValue(prop);
            if (val) target.style.setProperty(prop, val);
          } catch (e) { /* skip */ }
        });
      };

      // Helper: recursively apply computed styles to all element descendants
      const deepCopyStyles = (source: Element, target: Element) => {
        const sourceChildren = source.children;
        const targetChildren = target.children;
        for (let c = 0; c < sourceChildren.length && c < targetChildren.length; c++) {
          const srcChild = sourceChildren[c];
          const tgtChild = targetChildren[c] as HTMLElement;
          if (tgtChild.style !== undefined) {
            copyComputedStyles(srcChild, tgtChild);
          }
          deepCopyStyles(srcChild, tgtChild);
        }
      };

      for (let i = 0; i < slides.length; i++) {
        const originalSlide = slides[i] as HTMLElement;
        const slideClone = originalSlide.cloneNode(true) as HTMLElement;

        // Get computed background from the original (resolves CSS variables)
        const computedStyle = window.getComputedStyle(originalSlide);
        const originalBg = computedStyle.background;
        const originalBgColor = computedStyle.backgroundColor;
        // Get the actual computed padding (resolves 6vw to px at current viewport)
        // We scale it proportionally to our target 1920px width
        const currentVw = window.innerWidth;
        const paddingScale = slideWidth / currentVw;
        const originalPaddingTop = parseFloat(computedStyle.paddingTop) * paddingScale;
        const originalPaddingRight = parseFloat(computedStyle.paddingRight) * paddingScale;
        const originalPaddingBottom = parseFloat(computedStyle.paddingBottom) * paddingScale;
        const originalPaddingLeft = parseFloat(computedStyle.paddingLeft) * paddingScale;

        // Force slide dimensions matching fullscreen exactly
        slideClone.style.cssText = `
          width: ${slideWidth}px !important;
          height: ${slideHeight}px !important;
          min-height: ${slideHeight}px !important;
          max-height: ${slideHeight}px !important;
          padding: ${originalPaddingTop}px ${originalPaddingRight}px ${originalPaddingBottom}px ${originalPaddingLeft}px !important;
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
          transform: none !important;
          opacity: 1 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
        `;

        // Also copy any inline style overrides from the original slide (e.g. padding, justifyContent)
        const origInlineStyle = originalSlide.getAttribute('style');
        if (origInlineStyle) {
          // Parse individual properties from inline style, scale vw/vh units
          const inlineProps = origInlineStyle.split(';').filter(Boolean);
          inlineProps.forEach(prop => {
            const [key, val] = prop.split(':').map(s => s?.trim());
            if (!key || !val) return;
            // Skip properties we've already explicitly set
            if (['width', 'height', 'min-height', 'max-height', 'position', 'top', 'left'].includes(key)) return;
            // Convert vw/vh values
            let resolvedVal = val;
            if (val.includes('vw')) {
              resolvedVal = val.replace(/(\d+(?:\.\d+)?)vw/g, (_, n) => `${(parseFloat(n) / 100 * slideWidth)}px`);
            }
            if (val.includes('vh')) {
              resolvedVal = val.replace(/(\d+(?:\.\d+)?)vh/g, (_, n) => `${(parseFloat(n) / 100 * slideHeight)}px`);
            }
            try { slideClone.style.setProperty(key, resolvedVal); } catch (e) { /* skip */ }
          });
        }

        // Deep copy computed styles from original to clone for all children
        // This ensures text wrapping, font sizes, gaps, etc. match exactly
        deepCopyStyles(originalSlide, slideClone);

        // Force all animated elements to final state
        slideClone.classList.add('in-view');
        slideClone.querySelectorAll('.animate-enter, .layer-card, .funding-segment, .chat-message, [class*="animate"]').forEach((el: HTMLElement) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.transition = 'none';
          el.style.animation = 'none';
        });

        // FIX: Image Distortion (Team Avatars)
        slideClone.querySelectorAll('.avatar-circle').forEach((avatar: HTMLElement) => {
          const img = avatar.querySelector('img') as HTMLImageElement;
          if (img) {
            const src = img.getAttribute('src');
            const replacementDiv = document.createElement('div');
            replacementDiv.style.width = '100%';
            replacementDiv.style.height = '100%';
            replacementDiv.style.borderRadius = '50%';
            replacementDiv.style.backgroundImage = `url(${src})`;
            replacementDiv.style.backgroundSize = 'cover';
            replacementDiv.style.backgroundPosition = img.style.objectPosition || 'center';
            replacementDiv.style.transform = img.style.transform || 'none';
            avatar.innerHTML = '';
            avatar.appendChild(replacementDiv);
          }
        });

        // Ensure other images are visible and not distorted
        slideClone.querySelectorAll('img').forEach((img: HTMLImageElement) => {
          img.style.objectFit = 'contain';
          img.style.maxWidth = '100%';
        });

        // Force funding segment widths (in case animation state wasn't applied)
        slideClone.querySelectorAll('.funding-segment.fill-40').forEach((el: HTMLElement) => el.style.width = '40%');
        slideClone.querySelectorAll('.funding-segment.fill-24').forEach((el: HTMLElement) => el.style.width = '24%');
        slideClone.querySelectorAll('.funding-segment.fill-16').forEach((el: HTMLElement) => el.style.width = '16%');
        slideClone.querySelectorAll('.funding-segment.fill-20').forEach((el: HTMLElement) => el.style.width = '20%');

        // Boost subtle shadows so they render visibly in html2canvas/PDF
        slideClone.querySelectorAll('.metric-card, .highlight-box, .chat-window, .layer-card, .team-card-link').forEach((el: HTMLElement) => {
          const shadow = window.getComputedStyle(el).boxShadow;
          if (shadow && shadow !== 'none') {
            // Increase shadow opacity for PDF fidelity
            el.style.boxShadow = shadow.replace(/rgba?\(([^)]+)\)/g, (match, inner) => {
              const parts = inner.split(',').map((s: string) => s.trim());
              if (parts.length === 4) {
                const alpha = Math.min(parseFloat(parts[3]) * 2.5, 0.3);
                return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
              }
              return match;
            });
          }
        });

        // Remove UI controls
        slideClone.querySelectorAll('.pitch-controls, .control-btn').forEach((el) => el.remove());

        renderContainer.innerHTML = '';
        renderContainer.appendChild(slideClone);

        // Wait for rendering and font loading to stabilize
        await new Promise((resolve) => setTimeout(resolve, 250));

        const canvas = await html2canvas(slideClone, {
          width: slideWidth,
          height: slideHeight,
          windowWidth: slideWidth,
          windowHeight: slideHeight,
          scale: 5, // High resolution capture
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
             // Force the cloned document to match our target dimensions
             // so viewport units and media queries resolve as if fullscreen at 1920x1080
             clonedDoc.body.style.width = `${slideWidth}px`;
             clonedDoc.body.style.height = `${slideHeight}px`;
             clonedDoc.body.style.margin = '0';
             clonedDoc.body.style.padding = '0';
             clonedDoc.body.style.overflow = 'hidden';
             clonedDoc.documentElement.style.width = `${slideWidth}px`;
             clonedDoc.documentElement.style.height = `${slideHeight}px`;
             clonedDoc.documentElement.style.overflow = 'hidden';
          }
        });

        if (i > 0) pdf.addPage();
        // Use PNG for lossless quality
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');

        // Add clickable links for team cards on slide 10 (Team slide, index 9)
        if (i === 9) {
          // LinkedIn links for team members
          // Card positions are roughly: Charles (left), Keith (middle), Mike (right)
          // PDF coordinates are in mm, slides are 338.67mm x 190.5mm
          const cardWidth = 70; // approximate card width in mm
          const cardHeight = 80; // approximate card height in mm
          const cardY = 80; // approximate Y position from top
          const cardSpacing = 15;
          const startX = (pdfWidthMm - (cardWidth * 3 + cardSpacing * 2)) / 2;

          // Charles Sims
          pdf.link(startX, cardY, cardWidth, cardHeight, { url: 'https://www.linkedin.com/in/charlessims/' });
          // Keith Coleman
          pdf.link(startX + cardWidth + cardSpacing, cardY, cardWidth, cardHeight, { url: 'https://www.linkedin.com/in/keith-coleman-9000973/' });
          // Mike Belloli
          pdf.link(startX + (cardWidth + cardSpacing) * 2, cardY, cardWidth, cardHeight, { url: 'https://www.linkedin.com/in/mikebelloli/' });
        }

        // Add clickable links for final slide (slide 12, index 11) contact section
        if (i === 11) {
          // Contact section at bottom of slide
          const contactY = 140; // approximate Y position
          const contactWidth = 80;
          const contactHeight = 25;
          const contactSpacing = 20;
          const startX = (pdfWidthMm - (contactWidth * 3 + contactSpacing * 2)) / 2;

          // Charles contact
          pdf.link(startX, contactY, contactWidth, contactHeight, { url: 'https://www.linkedin.com/in/charlessims/' });
          // Keith contact
          pdf.link(startX + contactWidth + contactSpacing, contactY, contactWidth, contactHeight, { url: 'https://www.linkedin.com/in/keith-coleman-9000973/' });
          // Mike contact
          pdf.link(startX + (contactWidth + contactSpacing) * 2, contactY, contactWidth, contactHeight, { url: 'https://www.linkedin.com/in/mikebelloli/' });
        }
      }

      document.body.removeChild(renderContainer);
      pdf.save('AI_Studio_Teams_Presentation.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="pitch-controls">
      <div className="slide-counter">
        {activeSlideIndex + 1} / {totalSlides}
      </div>

      <button
        onClick={toggleEditable}
        className={`control-btn ${isEditable ? 'active' : ''}`}
        title={isEditable ? "Disable Editing" : "Enable Inline Editing"}
        style={{ color: isEditable ? 'var(--pitch-accent)' : 'inherit' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

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
