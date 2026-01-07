# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Stanford CREATE AI Challenge Proposals** - A Docusaurus documentation site containing three comprehensive proposals for the Stanford CREATE AI Challenge, each targeting a different track.

### Target Audience
- Primary: Stanford CREATE AI Challenge reviewers
- Secondary: Team members, stakeholders

### Submission Deadline
**January 12, 2026 at 12 PM PST**

### The Three Tracks

| Track | Title | Focus |
|-------|-------|-------|
| **Track 1** | Augment Teaching | AI Champions Teacher Training Program |
| **Track 2** | Augment Learning | Equity-Centered K-12 AI Curriculum |
| **Track 3** | Augment Career | AI Studio Teams & Workforce Pipeline |

### Funding Request
$50,000 per track

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve
```

## Architecture

### Technology Stack
- **Framework**: Docusaurus 3.x with TypeScript
- **Styling**: Custom CSS with Stanford cardinal red (#8C1515)

### Directory Structure
```
docs/
├── index.md                    # Landing page with track overview
├── track-1-teaching/           # Augment Teaching proposal
│   ├── index.md                # Executive summary
│   ├── problem.md              # Problem statement
│   ├── solution.md             # Proposed solution
│   ├── learning-science.md     # Research foundation
│   ├── outcomes.md             # Measurement plan
│   ├── equity.md               # Fairness & accessibility
│   ├── timeline.md             # Implementation timeline
│   ├── team.md                 # Team biographies
│   └── budget.md               # $50K budget breakdown
├── track-2-learning/           # Augment Learning proposal (same structure)
└── track-3-career/             # Augment Career proposal (same structure)
```

### Key Configuration Files
- `docusaurus.config.ts` - Main site configuration
- `sidebars.ts` - Navigation structure for all 3 tracks
- `src/css/custom.css` - Stanford branding and track colors

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
Print styles are included in custom.css for clean PDF export via browser print function.

## Related Projects

This proposal site draws from:
- `/Users/mikebelloli/Development/projects/stanford-create-ai-challenge/` - Original ESUSD school board documentation

The two sites operate independently but share the same underlying El Segundo AI Academy initiative.

## Team

- **Charles Sims** - Project Lead, Skafld Studio
- **Keith Coleman** - Technical Lead (Stanford affiliate)
