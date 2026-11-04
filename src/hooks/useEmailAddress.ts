import { useSyncExternalStore } from 'react'
import { content } from '../data/content'

// Nothing to subscribe to; this only lets us read a value that exists in the browser.
const subscribe = () => () => {}

// The email address, put together in the browser from its two parts in content.ts.
// It never appears whole in the HTML files or the JavaScript, which keeps it away
// from simple spam scrapers. Returns null if no email is set.
export function useEmailAddress(): string | null {
  const email = content.links.email
  return useSyncExternalStore(
    subscribe,
    () => (email ? `${email.user}@${email.domain}` : null),
    () => null,
  )
}
