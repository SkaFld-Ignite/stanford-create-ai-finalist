import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index', // Landing Page with Executive Summary
    {
      type: 'category',
      label: 'Proposal Details',
      collapsed: false,
      items: [
        'track-3-career/index',
        'track-3-career/problem',
        'track-3-career/solution',
        'track-3-career/learning-science',
        'track-3-career/outcomes',
        'track-3-career/equity',
        'track-3-career/timeline',
        'track-3-career/team',
        'track-3-career/budget',
      ],
    },
    {
      type: 'doc',
      id: 'pitch',
      label: 'Pitch Deck'
    }
  ],
};

export default sidebars;
