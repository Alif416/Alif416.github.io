// Starts loading the two main font files as early as possible.
//
// Without this, the browser first draws text in a fallback font and then swaps in the
// real font once the stylesheet has been read, which makes the text jump a little. The
// font files have hashed names, so the links are made at build time from the files the
// build produced. In `npm run dev` there is nothing to add.

import type { Plugin } from 'vite'

// The Latin files for the body font (Source Serif, upright) and the small-text font (Inter).
const PRELOAD = [/source-serif-4-latin-wght-normal-.*\.woff2$/, /inter-latin-wght-normal-.*\.woff2$/]

export default function preloadFonts(): Plugin {
  return {
    name: 'preload-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        if (!context.bundle) return []
        const names = Object.keys(context.bundle)
        return PRELOAD.flatMap((pattern) => {
          const file = names.find((name) => pattern.test(name))
          if (!file) return []
          return [
            {
              tag: 'link',
              // Fonts must be requested with "crossorigin" even from the same site.
              attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
              injectTo: 'head' as const,
            },
          ]
        })
      },
    },
  }
}
