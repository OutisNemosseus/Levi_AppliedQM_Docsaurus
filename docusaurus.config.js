// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Applied Quantum Mechanics - MATLAB Programs',
  tagline: 'Interactive documentation for Levi\'s Applied QM MATLAB programs',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  // Update this with your Render.com URL after deployment
  url: 'https://levi-applied-qm-docs.onrender.com',
  // Render.com hosts at root
  baseUrl: '/',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Applied QM MATLAB',
        logo: {
          alt: 'Applied QM Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Programs',
          },
          {
            href: 'https://github.com/OutisNemosseus/Levi_AppliedQM_Docsaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Programs',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/OutisNemosseus/Levi_AppliedQM_Docsaurus',
              },
            ],
          },
        ],
        copyright: `Applied Quantum Mechanics by A.F.J. Levi - Documentation built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['matlab'],
      },
    }),
};

module.exports = config;
