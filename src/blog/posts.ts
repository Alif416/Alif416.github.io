import { loaders, posts as allPosts } from 'virtual:blog'
import type { Post } from '../data/types'

// Newest first. Posts with the same date are sorted by title.
// Drafts are already left out of a production build by the build step.
export const posts: Post[] = [...allPosts].sort(
  (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
)

export const findPost = (slug: string): Post | undefined => posts.find((post) => post.slug === slug)

// Loads a post's body (HTML) on demand, so bodies stay out of the main bundle.
export const loadPostBody = async (slug: string): Promise<string> => {
  const load = loaders[slug]
  if (!load) throw new Error(`No post called "${slug}"`)
  return (await load()).html
}

// Where a post lives.
export const postHref = (slug: string): string => `#/blog/${slug}`
