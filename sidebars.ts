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
      label: 'Track 1: Augment Teaching',
      link: {
        type: 'doc',
        id: 'track-1-teaching/index',
      },
      items: [
        'track-1-teaching/problem',
        'track-1-teaching/solution',
        'track-1-teaching/learning-science',
        'track-1-teaching/outcomes',
        'track-1-teaching/equity',
        'track-1-teaching/timeline',
        'track-1-teaching/team',
        'track-1-teaching/budget',
      ],
    },
    {
      type: 'category',
      label: 'Track 2: Augment Learning',
      link: {
        type: 'doc',
        id: 'track-2-learning/index',
      },
      items: [
        'track-2-learning/problem',
        'track-2-learning/solution',
        'track-2-learning/learning-science',
        'track-2-learning/outcomes',
        'track-2-learning/equity',
        'track-2-learning/timeline',
        'track-2-learning/team',
        'track-2-learning/budget',
      ],
    },
    {
      type: 'category',
      label: 'Track 3: Augment Career',
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
