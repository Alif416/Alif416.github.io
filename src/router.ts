import { useSyncExternalStore } from 'react'

// A tiny router for GitHub Pages, which has no server rewrites. The address after the
// # decides the page:
//   #/blog/<slug>  -> a blog post
//   anything else  -> the home page (including section links such as #research)

export type Route = { name: 'home' } | { name: 'post'; slug: string }

const POST_PATTERN = /^#\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)$/

export function parseRoute(hash: string): Route {
  const match = POST_PATTERN.exec(hash)
  return match ? { name: 'post', slug: match[1] } : { name: 'home' }
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

// The current address hash. Components re-render when it changes.
export const useHash = (): string =>
  useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '',
  )

// Where the home page was scrolled to when a post was opened, so going back can return there.
let homeScroll = 0
export const rememberHomeScroll = (): void => {
  homeScroll = window.scrollY
}
export const getHomeScroll = (): number => homeScroll

// Scroll without the smooth animation, so page changes feel immediate.
export const jumpTo = (top: number): void => window.scrollTo({ top, behavior: 'instant' })
