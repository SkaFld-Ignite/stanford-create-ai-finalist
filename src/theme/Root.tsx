import React, { useState, useEffect } from 'react';

function Root({ children }) {
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    // Apply contentEditable to the main wrapper when isEditable is true
    const main = document.querySelector('main');
    const landingHero = document.querySelector('.landing-hero');
    const pitchDeck = document.querySelector('.pitch-deck-container');
    
    // Elements to toggle
    const targets = [main, landingHero, pitchDeck].filter(Boolean);

    if (isEditable) {
      targets.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        (el as HTMLElement).style.outline = '2px dashed rgba(140, 21, 21, 0.3)';
        (el as HTMLElement).style.outlineOffset = '4px';
      });
      document.body.classList.add('global-edit-mode-active');
    } else {
      targets.forEach(el => {
        el.removeAttribute('contenteditable');
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
      });
      document.body.classList.remove('global-edit-mode-active');
    }
  }, [isEditable]);

  return (
    <>
      {children}
      <button
        onClick={() => setIsEditable(!isEditable)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 10000,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isEditable ? '#8C1515' : 'white',
          color: isEditable ? 'white' : '#8C1515',
          border: '1px solid #8C1515',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          opacity: 0.6,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
        title={isEditable ? "Disable Editing" : "Enable Editing"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <style>{`
        .global-edit-mode-active [contenteditable="true"]:focus {
          outline: 2px solid #8C1515 !important;
          background: rgba(140, 21, 21, 0.02) !important;
        }
        /* Hide edit button in print */
        @media print {
          button { display: none !important; }
        }
      `}</style>
    </>
  );
}

export default Root;