import { defineConfig } from 'vitepress'

const siteBase = 'https://bghcore.github.io/formosaic'
const siteUrl = 'https://bghcore.github.io'
const ogDescription = 'Define forms as JSON with a declarative rules engine. 11 UI adapters, 20 condition operators, computed values, cross-field effects, auto-save, and TypeScript-first.'
const ogImage = `${siteBase}/formosaic-brand.png`

export default defineConfig({
  title: 'Formosaic',
  description: 'Configuration-driven forms with a built-in rules engine',
  base: '/formosaic/',
  lang: 'en-US',
  sitemap: {
    hostname: siteUrl,
    transformItems: (items) => items.map(item => ({
      ...item,
      url: `formosaic/${item.url}`
    }))
  },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/formosaic/formosaic-logo.png' }],
    ['meta', { name: 'keywords', content: 'react forms, form engine, rules engine, JSON forms, config-driven forms, react-hook-form, form builder, typescript forms, formosaic' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Formosaic — Configuration-driven forms with a built-in rules engine' }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: siteBase }],
    ['meta', { property: 'og:site_name', content: 'Formosaic' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Formosaic — Config-driven React forms with a rules engine' }],
    ['meta', { name: 'twitter:description', content: ogDescription }],
    ['meta', { name: 'twitter:image', content: ogImage }],
    ['link', { rel: 'canonical', href: siteBase }],
  ],
  themeConfig: {
    logo: '/formosaic-logo.png',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/field-config' },
      { text: 'Adapters', link: '/adapters/choosing' },
      {
        text: 'Links',
        items: [
          { text: 'Storybook', link: 'https://bghcore.github.io/formosaic/storybook/' },
          { text: 'GitHub', link: 'https://github.com/bghcore/formosaic' },
          { text: 'npm', link: 'https://www.npmjs.com/org/formosaic' },
          { text: 'Changelog', link: 'https://github.com/bghcore/formosaic/blob/main/CHANGELOG.md' }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Comparison', link: '/guide/comparison' },
            { text: 'Migrating from @form-eng', link: '/guide/migrating' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Rules Engine', link: '/guide/rules-engine' },
            { text: 'Condition Operators', link: '/guide/condition-operators' },
            { text: 'Expression Syntax', link: '/guide/expression-syntax' },
            { text: 'Validation', link: '/guide/validation' },
            { text: 'Value Functions', link: '/guide/value-functions' },
            { text: 'Templates & Composition', link: '/guide/templates' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Field Types', link: '/guide/field-types' },
            { text: 'Field Config Reference', link: '/guide/field-config' },
            { text: 'Analytics & Telemetry', link: '/guide/analytics' },
            { text: 'i18n / Localization', link: '/guide/i18n' },
            { text: 'SSR / Next.js', link: '/guide/ssr' },
            { text: 'Debugging Rules', link: '/guide/debugging-rules' },
            { text: 'Performance', link: '/guide/performance' },
            { text: 'Accessibility', link: '/guide/accessibility' },
            { text: 'Date Policy', link: '/guide/date-policy' }
          ]
        }
      ],
      '/adapters/': [
        {
          text: 'Adapters',
          items: [
            { text: 'Choosing an Adapter', link: '/adapters/choosing' },
            { text: 'Creating an Adapter', link: '/adapters/creating' },
            { text: 'Adapter Architecture', link: '/adapters/architecture' },
            { text: 'Parity Matrix', link: '/adapters/parity-matrix' },
            { text: 'Field Contracts', link: '/adapters/field-contracts' },
            { text: 'Divergence Register', link: '/adapters/divergence-register' },
            { text: 'shadcn Integration', link: '/adapters/shadcn' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Field Config', link: '/api/field-config' },
            { text: 'API Stability', link: '/api/stability' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bghcore/formosaic' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2024-present Formosaic Contributors'
    },
    editLink: {
      pattern: 'https://github.com/bghcore/formosaic/edit/main/website/:path'
    }
  }
})
