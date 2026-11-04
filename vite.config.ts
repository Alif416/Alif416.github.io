import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { content } from './src/data/content.ts'
import markdownPosts from './vite-plugins/markdown.ts'
import seo from './vite-plugins/seo.ts'

// https://vite.dev/config/
export default defineConfig({
  // User site (Alif416.github.io) is served from the domain root, so no sub-path.
  base: '/',
  plugins: [markdownPosts(content.site), seo(content), react()],
})
