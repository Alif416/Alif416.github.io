import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // User site (Alif416.github.io) is served from the domain root, so no sub-path.
  base: '/',
  plugins: [react()],
})
