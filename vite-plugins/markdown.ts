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
// A post with a problem fails the build with a message that names the file, so a
// broken post can never reach the live site.
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

export default function markdownPosts(): Plugin {
  let root = process.cwd()
  let dropDrafts = false

  const postsDir = () => join(root, POSTS_DIR)

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
    },

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : null
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null

      const dir = postsDir()
      const files = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.md')).sort() : []
      const posts: Meta[] = []
      const loaders: string[] = []

      for (const file of files) {
        const full = join(dir, file)
        this.addWatchFile(full)
        const { meta } = parsePost(readFileSync(full, 'utf8'), full, (message) => this.error(message))
        // Every post is checked above, but a draft is not kept in a production build.
        if (meta.draft && dropDrafts) continue
        posts.push(meta)
        loaders.push(`${JSON.stringify(meta.slug)}: () => import(${JSON.stringify(`/${POSTS_DIR}/${file}?html`)})`)
      }

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
