// The list of posts and a loader for each post's body. Both come from
// vite-plugins/markdown.ts, which reads the Markdown files in content/blog at build time.
declare module 'virtual:blog' {
  import type { Post } from '../data/types'
  export const posts: Post[]
  export const loaders: Record<string, () => Promise<{ html: string }>>
}
