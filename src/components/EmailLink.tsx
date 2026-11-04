import type { ReactNode } from 'react'
import { content } from '../data/content'
import { useEmailAddress } from '../hooks/useEmailAddress'

interface EmailLinkProps {
  className?: string
  children: ReactNode
}

// A mailto: link with custom content (for example an icon). The address is only
// put together in the browser. Renders nothing if no email is set.
export default function EmailLink({ className, children }: EmailLinkProps) {
  const address = useEmailAddress()

  if (!content.links.email) return null

  return (
    <a className={className} href={address ? `mailto:${address}` : undefined}>
      {children}
    </a>
  )
}
