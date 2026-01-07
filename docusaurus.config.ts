import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Stanford CREATE AI Challenge',
  tagline: 'El Segundo AI Academy - Transforming K-12 Education',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://stanford-create-ai.vercel.app',
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
      title: 'CREATE AI Challenge',
      logo: {
        alt: 'Stanford CREATE AI',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Proposals',
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
          title: 'Proposals',
          items: [
            {
              label: 'Track 1: Augment Teaching',
              to: '/track-1-teaching',
            },
            {
              label: 'Track 2: Augment Learning',
              to: '/track-2-learning',
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
      copyright: `El Segundo AI Academy | Stanford CREATE AI Challenge 2026`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
