// Types for the Markdown posts. They are turned into modules by vite-plugins/markdown.ts.
declare module '*.md' {
  import type { Post } from '../data/types'
  // null for a draft in a production build
  export const meta: Post | null
  export const html: string
}
