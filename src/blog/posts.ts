import type { Post } from '../data/types'

// Only the small `meta` export is loaded here, so post bodies stay out of this bundle.
const modules = import.meta.glob<Post | null>('/content/blog/*.md', {
  eager: true,
  import: 'meta',
})

// Drafts show in `npm run dev`. In a production build the plugin empties them
// (unless VITE_SHOW_DRAFTS=1, for testing), so they come through here as null.
// Newest first. Posts with the same date are sorted by title.
export const posts: Post[] = Object.values(modules)
  .filter((post): post is Post => post !== null)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

// Where a post lives. The post page itself is built in Phase 13.
export const postHref = (slug: string): string => `#/blog/${slug}`
