import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'HelperIQ',
    description:
      'Open-source customer support desk with AI-assisted replies, RAG knowledge base, and ecommerce integration.',
    ignoreDeadLinks: 'localhostLinks',
    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ],
    themeConfig: {
      logo: '/logo.svg',
      nav: [
        { text: 'Guide', link: '/getting-started/' },
        { text: 'Configuration', link: '/configuration/' },
        { text: 'Features', link: '/features/' },
        { text: 'API', link: '/api-reference/' },
      ],
      sidebar: [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Installation', link: '/getting-started/installation' },
          ],
        },
        {
          text: 'Configuration',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/configuration/' },
          ],
        },
        {
          text: 'Features',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/features/' },
          ],
        },
        {
          text: 'API Reference',
          collapsed: false,
          items: [
            { text: 'API Introduction', link: '/api-reference/' },
            { text: 'WebSocket API', link: '/api-reference/websocket' },
            {
              text: 'Core REST',
              collapsed: false,
              items: [
                { text: 'Conversations & Messages', link: '/api-reference/rest/conversations' },
                { text: 'Contacts', link: '/api-reference/rest/contacts' },
                { text: 'Agents & Teams', link: '/api-reference/rest/agents-teams' },
                { text: 'Statuses, Priorities & Tags', link: '/api-reference/rest/statuses-priorities-tags' },
                { text: 'AI', link: '/api-reference/rest/ai' },
                { text: 'Inboxes', link: '/api-reference/rest/inboxes' },
                { text: 'Macros', link: '/api-reference/rest/macros' },
                { text: 'Search', link: '/api-reference/rest/search' },
                { text: 'Media', link: '/api-reference/rest/media' },
                { text: 'Health', link: '/api-reference/rest/health' },
              ],
            },
            {
              text: 'HelperIQ Extensions',
              collapsed: false,
              items: [
                { text: 'RAG (Knowledge Base)', link: '/api-reference/rest/rag' },
                { text: 'Followers', link: '/api-reference/rest/followers' },
                { text: 'AI Settings', link: '/api-reference/rest/ai-settings' },
                { text: 'Ecommerce', link: '/api-reference/rest/ecommerce' },
                { text: 'PCI Scrubbing', link: '/api-reference/rest/pci' },
                { text: 'Forward', link: '/api-reference/rest/forward' },
                { text: 'Google Mobile Auth', link: '/api-reference/rest/google-mobile-auth' },
              ],
            },
          ],
        },
        {
          text: 'Contributing',
          collapsed: true,
          items: [{ text: 'Overview', link: '/contributing/' }],
        },
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/mageaustralia/libredesk' },
      ],
      footer: {
        message:
          'Released under AGPL-3.0. HelperIQ is a fork of <a href="https://github.com/abhinavxd/libredesk">LibreDesk</a>.',
        copyright: 'Copyright © 2026 Mage Australia',
      },
    },
  }),
)
