import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview',
    },
    {
      type: 'category',
      label: 'Proposal Details',
      link: {
        type: 'doc',
        id: 'track-3-career/index',
      },
      items: [
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
  ],
};

export default sidebars;
