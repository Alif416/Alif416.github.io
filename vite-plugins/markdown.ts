// Turns each Markdown file in content/blog into a module at build time.
//
// Each module exports:
//   meta - slug, title, date, tags, summary, readingTime, draft (small, used by the list)
//   html - the post body as HTML (used by the post page, so it stays out of the list's bundle)
//
// A post with a problem fails the build with a message that names the file, so a
// broken post can never reach the live site.

import { createRequire } from 'node:module'
import { basename } from 'node:path'
import { marked } from 'marked'
import type { Plugin } from 'vite'

// front-matter is a CommonJS package whose type file says "default export", which does
// not match how Node loads it. Loading it with require gives the real function.
const fm = createRequire(import.meta.url)('front-matter') as typeof import('front-matter').default

const ALLOWED_KEYS = ['title', 'date', 'tags', 'summary', 'readingTime', 'draft']
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const WORDS_PER_MINUTE = 200

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export default function markdownPosts(): Plugin {
  // Drafts are left out of production builds so their text never reaches visitors.
  // They stay in `npm run dev`, or in a build when VITE_SHOW_DRAFTS=1 (for testing).
  let dropDrafts = false

  return {
    name: 'markdown-posts',
    enforce: 'pre',
    configResolved(config) {
      dropDrafts = config.command === 'build' && process.env.VITE_SHOW_DRAFTS !== '1'
    },
    transform(source, id) {
      const file = id.split('?')[0]
      if (!file.endsWith('.md')) return null

      const name = basename(file)
      const fail = (message: string): never => {
        this.error(`Blog post "${name}": ${message}`)
      }

      const slug = name.replace(/\.md$/, '')
      if (!SLUG_PATTERN.test(slug)) {
        fail(
          `the filename must use only lowercase letters, digits, and single hyphens (for example "my-first-note.md"), but the slug is "${slug}".`,
        )
      }

      let parsed
      try {
        parsed = fm<Record<string, unknown>>(source)
      } catch (error) {
        return fail(`the frontmatter could not be read (${(error as Error).message}).`)
      }
      const data = parsed.attributes
      if (data === null || typeof data !== 'object') {
        return fail('the frontmatter is missing. Start the file with a block between two "---" lines.')
      }

      for (const key of Object.keys(data)) {
        if (!ALLOWED_KEYS.includes(key)) {
          fail(`unknown frontmatter field "${key}". Allowed fields: ${ALLOWED_KEYS.join(', ')}.`)
        }
      }

      const { title, date, tags, summary, readingTime, draft } = data
      if (typeof title !== 'string' || title.trim() === '') fail('"title" is required and must be text.')
      if (typeof date !== 'string' && !(date instanceof Date)) fail('"date" is required (format YYYY-MM-DD).')
      // YAML turns an unquoted 2026-03-01 into a Date, and quietly rolls an impossible
      // date like 2026-02-30 over to 2 March. So read the date as typed in the file.
      const typedDate = /^date:\s*['"]?([^'"#\n]*?)['"]?\s*(?:#.*)?$/m.exec(parsed.frontmatter ?? '')?.[1]
      const dateText =
        typeof date === 'string' ? date : typedDate ?? (date as Date).toISOString().slice(0, 10)
      if (!isRealDate(dateText)) fail(`"date" must be a real date in the format YYYY-MM-DD, but it is "${dateText}".`)
      if (typeof summary !== 'string' || summary.trim() === '') fail('"summary" is required (one or two plain sentences).')
      if (tags !== undefined && !(Array.isArray(tags) && tags.every((tag) => typeof tag === 'string'))) {
        fail('"tags" must be a list of text values, for example: tags: [nlp, notes].')
      }
      if (readingTime !== undefined && !(typeof readingTime === 'number' && readingTime > 0)) {
        fail('"readingTime" must be a positive number of minutes.')
      }
      if (draft !== undefined && typeof draft !== 'boolean') fail('"draft" must be true or false.')

      const words = parsed.body.split(/\s+/).filter(Boolean).length
      const meta = {
        slug,
        title: (title as string).trim(),
        date: dateText,
        tags: (tags as string[] | undefined) ?? [],
        summary: (summary as string).trim(),
        readingTime: (readingTime as number | undefined) ?? Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
        draft: (draft as boolean | undefined) ?? false,
      }

      // A draft is still checked above, but in a production build nothing of it is kept.
      if (meta.draft && dropDrafts) {
        return { code: 'export const meta = null;\nexport const html = "";\n', map: null }
      }

      const html = marked.parse(parsed.body, { async: false })

      return {
        code: `export const meta = ${JSON.stringify(meta)};\nexport const html = ${JSON.stringify(html)};\n`,
        map: null,
      }
    },
  }
}
