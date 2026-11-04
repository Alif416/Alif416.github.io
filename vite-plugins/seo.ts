// Search and sharing details for the site, built at build time from src/data/content.ts.
//
// Adds to the page head: title, description, canonical link, Open Graph and Twitter
// tags, theme color, icons, and structured data (JSON-LD). Adds a short <noscript>
// block for visitors without JavaScript. Writes robots.txt and sitemap.xml.
//
// Everything comes from the data file, so changing `site.url` there (for example when a
// custom domain is added) updates every address in one go.

import type { Plugin } from 'vite'
import type { Content } from '../src/data/types.ts'

export type SeoContent = Pick<Content, 'site' | 'person' | 'links' | 'education' | 'documents'>

const SOCIAL_IMAGE = 'social-card.png'
const SOCIAL_IMAGE_WIDTH = 1200
const SOCIAL_IMAGE_HEIGHT = 630

// These match --bg in src/index.css for the light and dark themes.
const THEME_COLOR_LIGHT = '#ffffff'
const THEME_COLOR_DARK = '#0f1216'

const esc = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default function seo(content: SeoContent): Plugin {
  const { site, person, links, education, documents } = content
  const base = site.url.endsWith('/') ? site.url : `${site.url}/`
  const imageUrl = `${base}${SOCIAL_IMAGE}`
  const imageAlt = `${person.name}, ${person.headline}`

  const profileLinks = [links.github, links.linkedin, links.scholar, links.orcid].filter(
    (link): link is string => link !== null,
  )

  // Structured data: only public facts that are already on the page. No email, phone,
  // address, or job title.
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    url: base,
    alumniOf: { '@type': 'CollegeOrUniversity', name: education.university },
    ...(profileLinks.length > 0 ? { sameAs: profileLinks } : {}),
  }

  // Shown only when JavaScript is off. The email is left out on purpose.
  const noscriptLinks: [string, string][] = [
    [documents.cv.label, documents.cv.url],
    [documents.transcript.label, documents.transcript.url],
    ...(links.github ? ([['GitHub', links.github]] as [string, string][]) : []),
    ...(links.linkedin ? ([['LinkedIn', links.linkedin]] as [string, string][]) : []),
    ...(links.scholar ? ([['Google Scholar', links.scholar]] as [string, string][]) : []),
    ...(links.orcid ? ([['ORCID', links.orcid]] as [string, string][]) : []),
  ]
  // It is the main part of the page when the app does not run, so it is a <main>. The links are
  // chips (44px tall), styled by the same CSS as the rest of the site.
  const noscript = [
    '<main class="container" style="padding-block: 2rem">',
    `<h1>${esc(person.name)}</h1>`,
    `<p>${esc(person.headline)}</p>`,
    `<p>${esc(person.bio)}</p>`,
    '<ul style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0; padding: 0; list-style: none">',
    ...noscriptLinks.map(([label, url]) => `<li><a class="chip" href="${esc(url)}">${esc(label)}</a></li>`),
    '</ul>',
    '</main>',
  ].join('')

  return {
    name: 'seo',

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const meta = (attrs: Record<string, string>) => ({ tag: 'meta', attrs, injectTo: 'head' as const })
        const link = (attrs: Record<string, string>) => ({ tag: 'link', attrs, injectTo: 'head' as const })

        return {
          html: html.replace(/<title>[^<]*<\/title>/, `<title>${esc(site.pageTitle)}</title>`),
          tags: [
            meta({ name: 'description', content: site.description }),
            meta({ name: 'author', content: person.name }),
            link({ rel: 'canonical', href: base }),

            meta({ property: 'og:type', content: 'website' }),
            meta({ property: 'og:site_name', content: site.title }),
            meta({ property: 'og:locale', content: 'en_US' }),
            meta({ property: 'og:title', content: site.pageTitle }),
            meta({ property: 'og:description', content: site.description }),
            meta({ property: 'og:url', content: base }),
            meta({ property: 'og:image', content: imageUrl }),
            meta({ property: 'og:image:type', content: 'image/png' }),
            meta({ property: 'og:image:width', content: String(SOCIAL_IMAGE_WIDTH) }),
            meta({ property: 'og:image:height', content: String(SOCIAL_IMAGE_HEIGHT) }),
            meta({ property: 'og:image:alt', content: imageAlt }),

            meta({ name: 'twitter:card', content: 'summary_large_image' }),
            meta({ name: 'twitter:title', content: site.pageTitle }),
            meta({ name: 'twitter:description', content: site.description }),
            meta({ name: 'twitter:image', content: imageUrl }),
            meta({ name: 'twitter:image:alt', content: imageAlt }),

            meta({ name: 'theme-color', content: THEME_COLOR_LIGHT, media: '(prefers-color-scheme: light)' }),
            meta({ name: 'theme-color', content: THEME_COLOR_DARK, media: '(prefers-color-scheme: dark)' }),

            link({ rel: 'icon', href: '/favicon.ico', sizes: '32x32' }),
            link({ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }),
            link({ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }),

            {
              tag: 'script',
              attrs: { type: 'application/ld+json' },
              // "<" is escaped so the data can never end the script tag early.
              children: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
              injectTo: 'head' as const,
            },
            { tag: 'noscript', children: noscript, injectTo: 'body-prepend' as const },
          ],
        }
      },
    },

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`,
      })
      // One page only. Blog posts use #/blog/... addresses, which search engines do not
      // treat as separate pages, and no "last modified" date is given rather than guess one.
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          '  <url>',
          `    <loc>${esc(base)}</loc>`,
          '  </url>',
          '</urlset>',
          '',
        ].join('\n'),
      })
    },
  }
}
