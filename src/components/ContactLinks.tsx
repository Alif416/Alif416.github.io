import type { ReactNode } from 'react'
import { content } from '../data/content'
import { GitHubIcon, LinkedInIcon, OrcidIcon, ScholarIcon } from './icons'

interface ContactLinkProps {
  href: string
  label: string
  children: ReactNode
}

function ContactLink({ href, label, children }: ContactLinkProps) {
  return (
    <a
      className="chip chip--icon"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      {label}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

// Academic and social links with icon and label. Anything null in content.ts is left out.
// Returns null when there is nothing to show.
export default function ContactLinks() {
  const { scholar, github, linkedin, orcid } = content.links
  const items = [
    scholar && { key: 'scholar', href: scholar, label: 'Google Scholar', icon: <ScholarIcon /> },
    github && { key: 'github', href: github, label: 'GitHub', icon: <GitHubIcon /> },
    linkedin && { key: 'linkedin', href: linkedin, label: 'LinkedIn', icon: <LinkedInIcon /> },
    orcid && { key: 'orcid', href: orcid, label: 'ORCID', icon: <OrcidIcon /> },
  ].filter((item) => item)

  if (items.length === 0) return null

  return (
    <ul className="contact__links" aria-label="Profiles">
      {items.map((item) =>
        item ? (
          <li key={item.key}>
            <ContactLink href={item.href} label={item.label}>
              {item.icon}
            </ContactLink>
          </li>
        ) : null,
      )}
    </ul>
  )
}
