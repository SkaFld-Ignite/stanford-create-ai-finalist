import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'AI Studio Teams',
  tagline: 'Portfolio-Based Pathways to AI-Era Careers',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://stanford-create-ai-finalist.vercel.app',
  baseUrl: '/',

  organizationName: 'skafld',
  projectName: 'stanford-create-ai-proposal',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'AI Studio Teams',
      logo: {
        alt: 'AI Studio Teams',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Proposal',
        },
        {
          href: 'https://acceleratelearning.stanford.edu/funding/create-ai-challenge/',
          label: 'Stanford Challenge',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Proposal',
          items: [
            {
              label: 'Overview',
              to: '/',
            },
            {
              label: 'Track 3: Augment Career',
              to: '/track-3-career',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Stanford CREATE AI Challenge',
              href: 'https://acceleratelearning.stanford.edu/funding/create-ai-challenge/',
            },
            {
              label: 'Stanford HAI',
              href: 'https://hai.stanford.edu/',
            },
          ],
        },
      ],
      copyright: `AI Studio Teams | Stanford CREATE AI Challenge 2026`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
