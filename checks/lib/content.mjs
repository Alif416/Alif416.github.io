// Reads the site's data and posts, so checks expect whatever the site is meant to show
// today. Nothing here is a copy of the text: change content.ts and the checks follow.

import { createRequire } from 'node:module'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const frontMatter = createRequire(import.meta.url)('front-matter')

export async function loadContent(root) {
  const module = await import(pathToFileURL(join(root, 'src/data/content.ts')).href)
  return module.content
}

// Every Markdown post in content/blog, newest first (same order as the site).
export function loadPosts(root) {
  const dir = join(root, 'content/blog')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const parsed = frontMatter(readFileSync(join(dir, file), 'utf8'))
      const a = parsed.attributes
      const date = a.date instanceof Date ? a.date.toISOString().slice(0, 10) : String(a.date)
      const words = parsed.body.split(/\s+/).filter(Boolean).length
      return {
        slug: file.replace(/\.md$/, ''),
        title: String(a.title),
        date,
        summary: String(a.summary),
        tags: a.tags ?? [],
        draft: a.draft === true,
        readingTime: a.readingTime ?? Math.max(1, Math.ceil(words / 200)),
        body: parsed.body,
      }
    })
    .sort((x, y) => y.date.localeCompare(x.date) || x.title.localeCompare(y.title))
}

// What the page should contain, worked out from the data (the same rule as src/nav.ts).
export function expectations(content, posts, variant) {
  const published = posts.filter((post) => !post.draft)
  const visible = variant === 'drafts' ? posts : published
  const sectionIds = content.nav.map((n) => n.id).filter((id) => id !== 'blog' || visible.length > 0)
  const navItems = content.nav.filter((n) => sectionIds.includes(n.id))
  return { published, visible, sectionIds, navItems, hasBlog: visible.length > 0 }
}

export const plain = (text) => String(text).replace(/\s*\(opens in a new tab\)/g, '').replace(/\s+/g, ' ').trim()
