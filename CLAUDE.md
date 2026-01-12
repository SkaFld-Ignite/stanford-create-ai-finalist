# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stanford CREATE AI Challenge Proposals** - A Docusaurus documentation site containing three comprehensive proposals for the Stanford CREATE AI Challenge, each targeting a different track.

- **Live Site**: https://stanford-create-ai.vercel.app
- **Repository**: https://github.com/SkaFld-Ignite/stanford-create-ai-challenge

### Submission Deadline
**January 12, 2026 at 12 PM PST**

### The Three Tracks

| Track | Title | Focus |
|-------|-------|-------|
| **Track 1** | Augment Teaching | AI Champions Teacher Training Program |
| **Track 2** | Augment Learning | Equity-Centered K-12 AI Curriculum |
| **Track 3** | Augment Career | AI Studio Teams & Workforce Pipeline |

Funding request: $50,000 per track

## Development Commands

```bash
npm install          # Install dependencies
npm start            # Start development server (hot reload)
npm run build        # Build for production
npm run serve        # Serve production build locally
npm run typecheck    # TypeScript type checking
npm run clear        # Clear Docusaurus cache
```

## Architecture

- **Framework**: Docusaurus 3.9 with TypeScript, React 19
- **Deployment**: Vercel (auto-deploys on push to main)
- **Docs as Root**: `routeBasePath: '/'` means docs are served at root, not `/docs`

### Key Files
- `docusaurus.config.ts` - Site config, navbar, footer, theme
- `sidebars.ts` - Navigation structure for all 3 tracks
- `src/css/custom.css` - Stanford branding (#8C1515) and track colors

### Track Structure
Each track folder (`docs/track-{1,2,3}-*/`) contains 8 standardized pages: index, problem, solution, learning-science, outcomes, equity, timeline, team, budget.

## Content Guidelines

### Stanford Evaluation Criteria
1. Innovation & Creativity
2. Learning Impact
3. Fairness & Inclusion
4. Use of Learning Sciences & Design
5. Measurement Plan
6. Feasibility & Sustainability

### Track Color Coding
- Track 1 (Teaching): Blue (#2563eb)
- Track 2 (Learning): Green (#059669)
- Track 3 (Career): Purple (#7c3aed)

### PDF Export
Print styles in custom.css support clean PDF export via browser print.

## Team

- **Charles Sims** - Project Lead, Skafld Studio
- **Keith Coleman** - Technical Lead (Stanford affiliate)
