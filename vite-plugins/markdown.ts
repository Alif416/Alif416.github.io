// Blog posts, built at build time from the Markdown files in content/blog.
//
// This plugin provides two kinds of modules:
//
//   import { posts, loaders } from 'virtual:blog'
//     posts   - the details of each published post (slug, title, date, tags, summary,
//               readingTime, draft). Small, used by the list.
//     loaders - slug -> () => import(post body), so a post's HTML is only loaded when
//               someone opens that post.
//
//   import('/content/blog/<slug>.md?html')
//     html    - the post body as HTML, with code already highlighted.
//
//   /feed.xml
//     An RSS feed of the published posts, written at build time (and served in dev).
//
// A post with a problem fails the build with a message that names the file, so a
// broken post can never reach the live site, and no feed is written either.
//
// Drafts (draft: true) are left out completely in a production build: they are not in
// the list, not in the loaders, and their body is empty, so nothing of a draft can be
// found in the built files. They show in `npm run dev`, or in a build with
// VITE_SHOW_DRAFTS=1 (for testing).

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, join } from 'node:path'
import { Marked } from 'marked'
import { bundledLanguages, codeToHtml } from 'shiki'
import type { Plugin } from 'vite'

// front-matter is a CommonJS package whose type file says "default export", which does
// not match how Node loads it. Loading it with require gives the real function.
const fm = createRequire(import.meta.url)('front-matter') as typeof import('front-matter').default

const VIRTUAL_ID = 'virtual:blog'
const RESOLVED_VIRTUAL_ID = '\0virtual:blog'
const POSTS_DIR = 'content/blog'

const ALLOWED_KEYS = ['title', 'date', 'tags', 'summary', 'readingTime', 'draft']
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const WORDS_PER_MINUTE = 200

type Fail = (message: string) => never

interface Meta {
  slug: string
  title: string
  date: string
  tags: string[]
  summary: string
  readingTime: number
  draft: boolean
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Reads and checks the frontmatter. Returns the post's details and the Markdown body.
function parsePost(source: string, file: string, fail: Fail): { meta: Meta; body: string } {
  const name = basename(file)
  const problem = (message: string): never => fail(`Blog post "${name}": ${message}`)

  const slug = name.replace(/\.md$/, '')
  if (!SLUG_PATTERN.test(slug)) {
    problem(
      `the filename must use only lowercase letters, digits, and single hyphens (for example "my-first-note.md"), but the slug is "${slug}".`,
    )
  }

  let parsed
  try {
    parsed = fm<Record<string, unknown>>(source)
  } catch (error) {
    return problem(`the frontmatter could not be read (${(error as Error).message}).`)
  }
  const data = parsed.attributes
  if (data === null || typeof data !== 'object') {
    return problem('the frontmatter is missing. Start the file with a block between two "---" lines.')
  }

  for (const key of Object.keys(data)) {
    if (!ALLOWED_KEYS.includes(key)) {
      problem(`unknown frontmatter field "${key}". Allowed fields: ${ALLOWED_KEYS.join(', ')}.`)
    }
  }

  const { title, date, tags, summary, readingTime, draft } = data
  if (typeof title !== 'string' || title.trim() === '') problem('"title" is required and must be text.')
  if (typeof date !== 'string' && !(date instanceof Date)) problem('"date" is required (format YYYY-MM-DD).')
  // YAML turns an unquoted 2026-03-01 into a Date, and quietly rolls an impossible
  // date like 2026-02-30 over to 2 March. So read the date as typed in the file.
  const typedDate = /^date:\s*['"]?([^'"#\n]*?)['"]?\s*(?:#.*)?$/m.exec(parsed.frontmatter ?? '')?.[1]
  const dateText = typeof date === 'string' ? date : typedDate ?? (date as Date).toISOString().slice(0, 10)
  if (!isRealDate(dateText)) problem(`"date" must be a real date in the format YYYY-MM-DD, but it is "${dateText}".`)
  if (typeof summary !== 'string' || summary.trim() === '') problem('"summary" is required (one or two plain sentences).')
  if (tags !== undefined && !(Array.isArray(tags) && tags.every((tag) => typeof tag === 'string'))) {
    problem('"tags" must be a list of text values, for example: tags: [nlp, notes].')
  }
  if (readingTime !== undefined && !(typeof readingTime === 'number' && readingTime > 0)) {
    problem('"readingTime" must be a positive number of minutes.')
  }
  if (draft !== undefined && typeof draft !== 'boolean') problem('"draft" must be true or false.')

  const words = parsed.body.split(/\s+/).filter(Boolean).length
  return {
    meta: {
      slug,
      title: (title as string).trim(),
      date: dateText,
      tags: (tags as string[] | undefined) ?? [],
      summary: (summary as string).trim(),
      readingTime: (readingTime as number | undefined) ?? Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
      draft: (draft as boolean | undefined) ?? false,
    },
    body: parsed.body,
  }
}

// Highlights code at build time. Unknown or missing languages become plain code.
// Shiki's <pre> can be focused with the keyboard, so long lines can be scrolled.
async function highlight(code: string, lang: string | undefined): Promise<string> {
  const language = (lang ?? '').trim().split(/\s+/)[0].toLowerCase()
  if (language && language in bundledLanguages) {
    return codeToHtml(code, {
      lang: language,
      // The high contrast pair keeps every token color at 4.5:1 or better on the code background.
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
      defaultColor: false,
    })
  }
  return `<pre tabindex="0"><code>${escapeHtml(code)}</code></pre>\n`
}

// Safety and tidiness for the rendered HTML. The author is Alif, so raw HTML is allowed,
// but scripts, inline event handlers, and javascript: links are removed.
function cleanHtml(html: string, name: string, fail: Fail): string {
  let out = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<script\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\b(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]*)/gi, '$1="#"')

  // Every image needs alt text.
  if (/<img\b(?![^>]*\balt\s*=)[^>]*>/i.test(out)) {
    fail(`Blog post "${name}": an image has no alt text. Add a short description, for example ![A diagram of the setup](url).`)
  }
  out = out.replace(/<img\b/gi, '<img loading="lazy" decoding="async"')

  // Wide tables scroll inside their own box, which can be reached with the keyboard.
  out = out
    .replace(/<table\b/g, '<div class="table-wrap" tabindex="0" role="region" aria-label="Table, scrolls sideways"><table')
    .replace(/<\/table>/g, '</table></div>')

  // Links to other sites open in a new tab.
  out = out.replace(/<a href="(https?:\/\/[^"]*)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"')
  return out
}

async function renderBody(body: string, name: string, fail: Fail): Promise<string> {
  const marked = new Marked({ async: true, gfm: true })
  marked.use({
    walkTokens: async (token) => {
      if (token.type === 'image' && String(token.text ?? '').trim() === '') {
        fail(`Blog post "${name}": an image has no alt text. Add a short description, for example ![A diagram of the setup](url).`)
      }
      if (token.type === 'code') {
        const html = await highlight(String(token.text), token.lang)
        Object.assign(token, { type: 'html', block: true, text: html })
      }
    },
  })
  const html = await marked.parse(body)
  return cleanHtml(html, name, fail)
}

export interface SiteOptions {
  title: string
  description: string
  // Full address of the site, for example https://alif416.github.io/
  url: string
}

const FEED_PATH = 'feed.xml'

// XML 1.0 allows tab, line feed, carriage return, and most other characters from space up
// (but not other control characters, which some pasted text can contain).
const isXmlChar = (code: number): boolean =>
  code === 0x9 ||
  code === 0xa ||
  code === 0xd ||
  (code >= 0x20 && code <= 0xd7ff) ||
  (code >= 0xe000 && code <= 0xfffd) ||
  (code >= 0x10000 && code <= 0x10ffff)

// Text for XML: special characters escaped, and characters XML does not allow removed.
const xml = (text: string): string =>
  [...text]
    .filter((char) => isXmlChar(char.codePointAt(0) ?? 0))
    .join('')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

// "2026-03-01" -> "Sun, 01 Mar 2026 00:00:00 GMT" (RFC 822, as RSS expects)
const rfc822 = (date: string): string => new Date(`${date}T00:00:00Z`).toUTCString()

// An RSS 2.0 feed of the given posts, newest first. Summary only, no full post text.
// Nothing here depends on the time of the build, so the same posts always give the same file.
function buildFeed(posts: Meta[], site: SiteOptions): string {
  const base = site.url.endsWith('/') ? site.url : `${site.url}/`
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

  const items = sorted.map((post) => {
    const link = `${base}#/blog/${post.slug}`
    return [
      '    <item>',
      `      <title>${xml(post.title)}</title>`,
      `      <link>${xml(link)}</link>`,
      `      <guid isPermaLink="true">${xml(link)}</guid>`,
      `      <pubDate>${rfc822(post.date)}</pubDate>`,
      `      <description>${xml(post.summary)}</description>`,
      ...post.tags.map((tag) => `      <category>${xml(tag)}</category>`),
      '    </item>',
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${xml(site.title)}</title>`,
    `    <link>${xml(base)}</link>`,
    `    <description>${xml(site.description)}</description>`,
    '    <language>en</language>',
    ...(sorted.length > 0 ? [`    <lastBuildDate>${rfc822(sorted[0].date)}</lastBuildDate>`] : []),
    `    <atom:link href="${xml(`${base}${FEED_PATH}`)}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}

export default function markdownPosts(site: SiteOptions): Plugin {
  let root = process.cwd()
  let dropDrafts = false

  const postsDir = () => join(root, POSTS_DIR)

  // Reads and checks every post in content/blog. A draft is checked too, but in a
  // production build it is not kept. Used for both the post list and the feed.
  const readPosts = (fail: Fail, watch?: (file: string) => void): { meta: Meta; file: string }[] => {
    const dir = postsDir()
    const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.md')).sort() : []
    const found: { meta: Meta; file: string }[] = []
    for (const file of files) {
      const full = join(dir, file)
      watch?.(full)
      const { meta } = parsePost(readFileSync(full, 'utf8'), full, fail)
      if (meta.draft && dropDrafts) continue
      found.push({ meta, file })
    }
    return found
  }

  return {
    name: 'markdown-posts',
    enforce: 'pre',

    configResolved(config) {
      root = config.root
      dropDrafts = config.command === 'build' && process.env.VITE_SHOW_DRAFTS !== '1'
    },

    configureServer(server) {
      const dir = postsDir()
      server.watcher.add(dir)
      const refresh = (file: string) => {
        if (!file.startsWith(dir) || !file.endsWith('.md')) return
        const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh)
      server.watcher.on('change', refresh)
      server.watcher.on('unlink', refresh)

      // The feed, with drafts, so it can be previewed while writing.
      server.middlewares.use(`/${FEED_PATH}`, (_request, response) => {
        try {
          const feed = buildFeed(readPosts((message) => { throw new Error(message) }).map((post) => post.meta), site)
          response.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
          response.end(feed)
        } catch (error) {
          response.statusCode = 500
          response.end((error as Error).message)
        }
      })
    },

    // Adds the feed to the page head so browsers and feed readers can find it.
    transformIndexHtml() {
      return [
        {
          tag: 'link',
          attrs: { rel: 'alternate', type: 'application/rss+xml', title: site.title, href: `/${FEED_PATH}` },
          injectTo: 'head',
        },
      ]
    },

    // Writes feed.xml next to the site. If any post is broken the build has already
    // failed before this point, so a partial feed is never written.
    generateBundle() {
      const posts = readPosts((message) => this.error(message)).map((post) => post.meta)
      this.emitFile({ type: 'asset', fileName: FEED_PATH, source: buildFeed(posts, site) })
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null

      const found = readPosts(
        (message) => this.error(message),
        (file) => this.addWatchFile(file),
      )
      const posts = found.map((post) => post.meta)
      const loaders = found.map(
        ({ meta, file }) => `${JSON.stringify(meta.slug)}: () => import(${JSON.stringify(`/${POSTS_DIR}/${file}?html`)})`,
      )

      return `export const posts = ${JSON.stringify(posts)};\nexport const loaders = {${loaders.join(',')}};\n`
    },

    async transform(source, id) {
      const [file, query] = id.split('?')
      if (!file.endsWith('.md') || query !== 'html') return null

      const fail: Fail = (message) => this.error(message)
      const { meta, body } = parsePost(source, file, fail)
      const html = meta.draft && dropDrafts ? '' : await renderBody(body, basename(file), fail)
      return { code: `export const html = ${JSON.stringify(html)};\n`, map: null }
    },
  }
}
