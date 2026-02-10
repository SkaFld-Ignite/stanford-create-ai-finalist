import React, { useEffect, useState, useRef, useCallback } from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const PITCH_DATA = [
  {
    title: "Slide 1: Title (15s)",
    speaker: "[Charles or Keith opens]",
    narrative: "Good afternoon. I'm [Name], joined by [teammates]. We're here from AI Studio Teams with a question that's keeping educators and employers up at night: How do we prepare the next generation for careers when the bridge to those careers is collapsing?",
    transition: "[CLICK to Slide 2]"
  },
  {
    title: "Slide 2: The Experience Paradox (45s)",
    speaker: "[Continue]",
    narrative: `The numbers tell a stark story.

[Gesture to stats]
Two out of three employers won't hire without AI skills.
78% of hiring managers predict AI will displace recent graduates.
45% reduction in tech entry-level roles.

The floor is rising while the ladder is shrinking. That is the EXPERIENCE PARADOX: Young people can't gain experience because the entry-level positions that provide experience are disappearing.

[Pause - this is the hook]

But here's what makes it worse: CREDENTIALS are losing value too.

A degree shows coursework completion—not workplace capability in AI-transformed environments. So students are trapped: no entry point to gain experience, and credentials that don't prove they can perform.

This isn't a future problem. It's happening RIGHT NOW.`,
    emphasis: [
      "Pause after 'experience are disappearing' - let it land",
      "'Credentials are losing value' connects to our thesis (portfolio > credentials)",
      "'Right NOW' creates urgency"
    ],
    transition: "[CLICK to Slide 3]"
  },
  {
    title: "Slide 3: Teach Them to Fish (30s)",
    speaker: "[Continue]",
    narrative: `So what's the solution?

[Pause, then with conviction]

DON'T give them the fish. Teach them to FISH.

Most AI training teaches prompts that expire in months. ChatGPT prompts from last year are already obsolete.

We build AI RESILIENCE THROUGH REAL BUSINESS CHALLENGES—metacognitive skills that transfer across ANY AI tool, because tools change, but the way you THINK persists.

We're not just teaching AI. We're building AI resilience—teaching students how to LEARN.`,
    emphasis: [
      "The 'teaching to fish' metaphor is universally understood",
      "Emphasize 'how to THINK' and 'how to LEARN' - this is the differentiator",
      "'AI resilience' is a World Bank institutional term - carries weight"
    ],
    transition: "[CLICK to Slide 4]"
  },
  {
    title: "Slide 4: SkaFld Trailhead (45s)",
    speaker: "[Can transition to Mike or Charles here]",
    narrative: `This is SkaFld Trailhead—our platform for verified capability.

[Point to platform components]

Three tools working together: an AI COACH for Socratic guidance. A TEACHER DASHBOARD giving educators real-time visibility into student progress. And an EMPLOYER PORTAL where industry validates real work.

Teachers lead weekly 90-minute sessions through a scaffolded journey. In the FOUNDATION phase, weeks 1-4, students learn decomposition thinking and basic AI discernment.

Then, we ramp up the difficulty.

In the APPLICATION phase, weeks 5-8, students solve INCREASINGLY DIFFICULT business simulations. They have to expand their AI toolset—adapting to new models and techniques—to solve problems that simple prompts can't handle.

Finally, in the DEMONSTRATION phase, weeks 9-12, they prove mastery by delivering actual projects for local employers.

The result? Portfolios that PROVE capability—not credentials that claim it.`,
    emphasis: [
      "Emphasize 'increasingly difficult' - show the progression",
      "'Expand their toolset' - connects to adaptability",
      "'Simple prompts can't handle' - reinforces 'Teach to Fish'"
    ],
    transition: "[CLICK to Slide 5]"
  },
  {
    title: "Slide 5: From Crutch to Catalyst (30s)",
    speaker: "[Continue or visual only]",
    narrative: `This is how we move from Crutch to Catalyst.

[Reference chat demo visual]

In this pilot scenario with Boeing, the AI coach doesn't provide the answer. It asks the student to DECOMPOSE the problem: 'What are the key failure points in quality control documentation?'

The student identifies the real-world friction: handoffs between shifts and manual entry errors.

Then, the AI nudges them to RESEARCH WIDE—looking at how healthcare and aviation have solved similar handoff challenges.

This is ACTIVE learning. The AI is a catalyst for critical thinking—and it frees TEACHERS to do what humans do best: build relationships and provide the motivation that no AI can replicate.`,
    emphasis: [
      "'From Crutch to Catalyst' - direct answer to summit theme",
      "AI coach doesn't provide the answer - mechanism of catalyst",
      "Research wide - core SkaFld methodology"
    ],
    transition: "[CLICK to Slide 6]"
  },
  {
    title: "Slide 6: Four Pillars (30s)",
    speaker: "[Continue]",
    narrative: `Our approach is built on four pillars—each backed by validated learning science. These aren't four separate courses—they're integrated into every project.

[Quick overview of four pillars]

PORTFOLIO over credentials: Work samples predict job success FIVE TIMES better than grades. Schmidt and Hunter's meta-analysis.

SOCIAL LEARNING & MENTORSHIP: Teachers lead. Seniors mentor sophomores. AI scaffolds the connections between them—amplifying what humans do best.

EMPLOYER integration: Real projects with real stakes. Lave and Wenger proved authentic context produces deeper understanding.

And RESPONSIBLE AI practices—students learn WHY ethical boundaries matter. Active judgment, not just guardrails. This is Human-Centered AI.`,
    emphasis: [
      "Say 'four pillars' to establish the framework",
      "'Integrated, not isolated' - aligns with World Bank CoI (Jan 2026)",
      "Quickly cite the research - establishes credibility",
      "Emphasize 'Human-Centered AI'"
    ],
    transition: "[CLICK to Slide 7]"
  },
  {
    title: "Slide 7: Methodology (20s)",
    speaker: "[Keith or Charles - methodology ownership]",
    narrative: `This is the methodology we teach. A three-step process to innovation.

First, ESCAPE the 'Expert Trap'—stop assuming you know the answer.

Second, RESEARCH WIDE. We guide students to explore INVERSE, ANALOGOUS, and EXTREME domains.

Third, VALIDATE NARROW. Translate those patterns back to the problem and prove they work.

That's how students generate breakthroughs on demand.`,
    emphasis: [
      "Walk through the visual steps: Escape -> Research -> Validate",
      "Emphasize 'Research Wide' as the core differentiator",
      "'Breakthroughs on demand' creates sense of repeatable capability"
    ],
    transition: "[CLICK to Slide 8]"
  },
  {
    title: "Slide 8: Traction (30s)",
    speaker: "[Continue]",
    narrative: `Why El Segundo?

The nation's densest aerospace and tech corridor. Boeing. Northrop Grumman. Entertainment headquarters. 5 schools. 3,400 students. We're already co-designing with district teachers—built WITH educators, not imposed on them.

Year 1: 96 students in 8 teams. 12 employer partners. 24 paid internships.

This is proof of concept for California-wide expansion in Year 2, and national SaaS rollout in Year 3.

Stanford CREATE+AI is the catalyst that makes all of this possible.`,
    emphasis: [
      "Quick stats to establish scale and credibility",
      "Employer names add legitimacy",
      "Clear path from pilot to scale"
    ],
    transition: "[CLICK to Slide 9]"
  },
  {
    title: "Slide 9: Equity (30s)",
    speaker: "[Can transition speakers here]",
    narrative: `We're moving beyond simple access to UNIVERSAL LEARNING.

Our answer: EVERYONE.

[Point to targets]
50% female representation target.
40% free and reduced lunch eligible.
30% first-generation college.

We apply UNIVERSAL DESIGN principles.

No coding prerequisites. No GPA hurdles. No equipment costs.

Portfolios are the great equalizer. They shift the focus from where you went to school to what you can DO. Focus on what you can do. Unlock your potential.`,
    emphasis: [
      "'Universal Learning' - aligns with summit themes",
      "Concrete parity targets demonstrate commitment",
      "Portfolios are the great equalizer - connects equity to thesis"
    ],
    transition: "[CLICK to Slide 10]"
  },
  {
    title: "Slide 10: Team (30s)",
    speaker: "[Each person can intro briefly, or one person covers all]",
    narrative: `We're the right team to execute this.

[Charles] Charles Sims—Project Director. Former CTO of the LA Clippers and UTA. Founder of SkaFld Studio. Board Member of the El Segundo EDC.

[Keith] Keith Coleman—Strategy and Partnerships. Advisory Scholar at Stanford mediaX. Co-Chair of the UN SDG Fund Breakthrough Alliance.

[Mike] Mike Belloli—Technology and Operations. COO of SkaFld Studio. Co-Founder of Lyfe AI. Full-stack developer and platform architect.

Technology. Design. Policy. We bring interdisciplinary expertise to match our interdisciplinary methodology.`,
    emphasis: [
      "Stanford connection establishes insider credibility",
      "Each person has distinct domain expertise",
      "'Technology. Design. Policy.' - the core header"
    ],
    transition: "[CLICK to Slide 11]"
  },
  {
    title: "Slide 11: The Ask (30s)",
    speaker: "[Lead closes]",
    narrative: `The first dollar is the hardest. This is that dollar.

[Gesture to funding bar]
$50,000 funds Year 1: platform development, pilot implementation, assessment, and operations.

This award proves the model. It enables conversations with district partners, industry sponsors, and impact investors that turn a pilot into a movement.

Stanford's backing opens every door we need.

Year 2 and beyond is sustainable: District CTE contracts and employer partners fund ongoing operations.`,
    emphasis: [
      "'First dollar is hardest' - resonance",
      "Frame $50K as CATALYST",
      "Demonstrate clear sustainability path"
    ],
    transition: "[CLICK to Slide 12]"
  },
  {
    title: "Slide 12: Closing (30s)",
    speaker: "[Lead closes - strong finish]",
    narrative: `AI Studio Teams.

Teaching the next generation to fish.

The entry-level bridge is collapsing. Credentials are losing their value. And young people need a new pathway to careers.

We're rebuilding that bridge—through portfolios that prove capability, mentorship that develops potential, and AI that teaches HOW to learn.

This isn't another supplement to existing pathways. It's a transformation of how students prove what they can do.

Human-centered. Interdisciplinary. Portfolio-proven.

Thank you. We're ready for your questions.`,
    emphasis: [
      "Circle back to opening ('bridge collapsing')",
      "'Transformation, not supplement' - signals systemic change",
      "Triple tagline: 'Human-centered. Interdisciplinary. Portfolio-proven.'"
    ],
    transition: "END OF PITCH"
  }
];

export default function PitchInternal() {
  const { siteConfig } = useDocusaurusContext();
  const [activeIndex, setActiveSlideIndex] = useState(0);
  
  // Layout States
  const [leftWidth, setLeftWidth] = useState(70); 
  const [topHeight, setTopHeight] = useState(60); 
  const [dragMode, setDragMode] = useState<'none' | 'horiz' | 'vert'>('none');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    document.body.classList.add('pitch-internal-page');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SLIDE_CHANGE') {
        const index = event.data.index;
        setActiveSlideIndex(index);
        
        // Scroll right pane list to sync
        const rightItem = document.getElementById(`right-slide-${index + 1}`);
        if (rightItem && rightPaneRef.current) {
          rightItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      document.body.classList.remove('pitch-internal-page');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleResize = useCallback((e: MouseEvent) => {
    if (dragMode === 'none' || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    if (dragMode === 'horiz') {
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newLeftWidth > 30 && newLeftWidth < 90) setLeftWidth(newLeftWidth);
    } else if (dragMode === 'vert') {
      const newTopHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      if (newTopHeight > 20 && newTopHeight < 80) setTopHeight(newTopHeight);
    }
  }, [dragMode]);

  const stopDragging = useCallback(() => setDragMode('none'), []);

  useEffect(() => {
    if (dragMode !== 'none') {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopDragging);
    }
    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopDragging);
    };
  }, [dragMode, handleResize, stopDragging]);

  const handleSlideSelect = (index: number) => {
    setActiveSlideIndex(index);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'GOTO_SLIDE', index }, '*');
    }
  };

  const currentSlide = PITCH_DATA[activeIndex];

  return (
    <Layout title="Pitch Practice View" noFooter>
      <div className={`pitch-internal-container drag-${dragMode}`} ref={containerRef}>
        
        {/* TOP ROW */}
        <div className="row-top" style={{ height: `${topHeight}%` }}>
          
          {/* SLIDE VIEWER (Blue section in request) */}
          <div className="pane-preview" style={{ width: `${leftWidth}%` }}>
            <div className="preview-fit-wrapper">
              <div className="preview-aspect-box">
                {dragMode !== 'none' && <div className="iframe-overlay" />}
                <iframe 
                  ref={iframeRef}
                  src="/pitch" 
                  title="Pitch Deck" 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* VERTICAL SPLITTER */}
          <div className="splitter-vert" onMouseDown={(e) => { e.preventDefault(); setDragMode('horiz'); }}>
            <div className="splitter-knob-vert" />
          </div>

          {/* NAVIGATOR (Red section in request) */}
          <div className="pane-navigator" ref={rightPaneRef} style={{ width: `${100 - leftWidth}%` }}>
            <div className="nav-header">SLIDE NAVIGATOR</div>
            <div className="nav-list">
              {PITCH_DATA.map((item, i) => (
                <div 
                  key={i} 
                  id={`right-slide-${i + 1}`}
                  className={`nav-item ${activeIndex === i ? 'active' : ''}`}
                  onClick={() => handleSlideSelect(i)}
                >
                  <div className="nav-item-top">
                    <span className="nav-num">{i + 1}</span>
                    <div className="nav-title">{item.title.split(':')[1]?.trim() || item.title}</div>
                  </div>
                  {item.speaker && <div className="nav-speaker">{item.speaker}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HORIZONTAL SPLITTER */}
        <div className="splitter-horiz" onMouseDown={(e) => { e.preventDefault(); setDragMode('vert'); }}>
          <div className="splitter-knob-horiz" />
        </div>

        {/* BOTTOM ROW: NARRATIVE (Third section in request) */}
        <div className="pane-narrative" style={{ height: `${100 - topHeight}%` }}>
          {currentSlide && (
            <div className="narrative-full-width-container">
              <div className="narrative-header-minimal">
                <div className="header-left">
                  <span className="header-num-badge">{activeIndex + 1}</span>
                  <h2 className="header-title-text">{currentSlide.title}</h2>
                </div>
                {currentSlide.speaker && <div className="header-speaker-badge">{currentSlide.speaker}</div>}
              </div>

              <div className="narrative-compact-grid">
                {/* SCRIPT (Left) */}
                <div className="grid-script">
                  <div className="compact-label">SPEAKER SCRIPT</div>
                  <div className="script-text-area">
                    {currentSlide.narrative.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>

                {/* INFO (Right) */}
                <div className="grid-info">
                  {currentSlide.emphasis && (
                    <div className="info-block">
                      <div className="compact-label">EMPHASIS</div>
                      <ul className="info-list">
                        {currentSlide.emphasis.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="info-block">
                    <div className="compact-label">TRANSITION</div>
                    <div 
                      className="transition-cue-text interactive" 
                      onClick={() => activeIndex < PITCH_DATA.length - 1 && handleSlideSelect(activeIndex + 1)}
                      style={{ cursor: 'pointer' }}
                      title="Next Slide"
                    >
                      {currentSlide.transition}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .pitch-internal-page .navbar { display: none; }
        .pitch-internal-container {
          display: flex; flex-direction: column;
          height: 100vh; width: 100vw;
          overflow: hidden; background: #000;
          font-family: 'Inter', sans-serif;
        }
        
        /* Top Row */
        .row-top { display: flex; width: 100%; overflow: hidden; background: #111; }
        
        /* Slide Viewer Container */
        .pane-preview {
          display: flex; align-items: center; justify-content: center;
          padding: 15px; position: relative; overflow: hidden;
          background: #000;
        }
        .preview-fit-wrapper {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }
        .preview-aspect-box {
          /* This logic ensures it fits 16:9 perfectly within the pane without clipping */
          width: 100%; height: 100%;
          max-width: calc((100vh * ${topHeight / 100}) * 1.77); 
          max-height: calc((100vw * ${leftWidth / 100}) * 0.5625);
          aspect-ratio: 16 / 9;
          background: #000;
          box-shadow: 0 0 40px rgba(0,0,0,0.8);
          position: relative;
          border: 1px solid #333;
        }
        .iframe-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          z-index: 100; background: transparent;
        }

        /* Navigator */
        .pane-navigator {
          background: #111; height: 100%; display: flex; flex-direction: column;
          border-left: 1px solid #222;
        }
        .nav-header {
          padding: 0.75rem 1.25rem; font-weight: 900; color: #555; font-size: 0.65rem;
          letter-spacing: 0.15em; border-bottom: 1px solid #222;
        }
        .nav-list { flex: 1; overflow-y: auto; padding: 0.5rem; }
        .nav-item {
          padding: 0.75rem; border-radius: 6px; margin-bottom: 0.25rem;
          cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent;
        }
        .nav-item:hover { background: #1a1a1a; }
        .nav-item.active { background: #222; border-color: #8C1515; }
        .nav-item-top { display: flex; align-items: center; gap: 0.5rem; }
        .nav-num { color: #8C1515; font-weight: 900; font-size: 0.7rem; }
        .nav-title { color: #ccc; font-weight: 600; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nav-speaker { color: #555; font-size: 0.6rem; font-weight: 700; padding-left: 1.2rem; text-transform: uppercase; }

        /* Narrative Pane (Bottom) */
        .pane-narrative {
          background: #fff; overflow-y: auto; color: #1a1a1a;
          border-top: 1px solid #ddd;
        }
        .narrative-full-width-container { width: 100%; padding: 1.5rem 2.5rem; }
        .narrative-header-minimal {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #f0f0f0;
        }
        .header-left { display: flex; align-items: center; gap: 1.25rem; }
        .header-num-badge {
          background: #8C1515; color: white; width: 32px; height: 32px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: 900; font-size: 1rem;
        }
        .header-title-text { margin: 0; font-size: 1.5rem; font-weight: 800; color: #111; }
        .header-speaker-badge {
          background: #f0f0f0; color: #8C1515; padding: 4px 12px; border-radius: 15px;
          font-weight: 800; font-size: 0.85rem; text-transform: uppercase;
        }

        .narrative-compact-grid { display: flex; gap: 2.5rem; }
        .grid-script { flex: 2.5; }
        .grid-info { flex: 1; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .compact-label {
          font-size: 0.7rem; font-weight: 900; color: #bbb;
          letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.75rem;
        }
        .script-text-area { font-size: 1.3rem; line-height: 1.5; color: #333; }
        .script-text-area p { margin-bottom: 1rem; white-space: pre-wrap; }
        
        .info-list { padding-left: 1rem; margin: 0; color: #666; font-size: 1.05rem; }
        .info-list li { margin-bottom: 0.5rem; }
        
        .transition-cue-text {
          background: #fffafa; color: #8C1515; padding: 0.75rem; border-radius: 8px;
          font-weight: 700; border: 1px dashed rgba(140, 21, 21, 0.3);
          font-size: 1rem;
        }

        /* Splitters */
        .splitter-vert {
          width: 6px; cursor: col-resize; background: #222;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s; z-index: 50;
        }
        .splitter-vert:hover { background: #8C1515; }
        .splitter-knob-vert { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }

        .splitter-horiz {
          height: 6px; cursor: row-resize; background: #222;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s; z-index: 50;
        }
        .splitter-horiz:hover { background: #8C1515; }
        .splitter-knob-horiz { height: 1px; width: 20px; background: rgba(255,255,255,0.1); }

        /* Drag Overrides */
        .drag-horiz *, .drag-vert * { pointer-events: none !important; }
      `}</style>
    </Layout>
  );
}