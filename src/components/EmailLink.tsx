import { useSyncExternalStore, type ReactNode } from 'react'
import { content } from '../data/content'

interface EmailLinkProps {
  className?: string
  children: ReactNode
}

// Nothing to subscribe to; this only lets us read a value that exists in the browser.
const subscribe = () => () => {}

// Light spam protection: the address is stored in two parts in content.ts and the
// mailto: link is only put together in the browser. It never appears in the HTML
// files that are served. Renders nothing if no email is set.
export default function EmailLink({ className, children }: EmailLinkProps) {
  const email = content.links.email
  const href = useSyncExternalStore(
    subscribe,
    () => (email ? `mailto:${email.user}@${email.domain}` : undefined),
    () => undefined,
  )

  if (!email) return null

  return (
    <a className={className} href={href}>
      {children}
    </a>
  )
}
