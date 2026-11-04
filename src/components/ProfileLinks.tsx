import type { ReactNode } from 'react'
import { content } from '../data/content'
import EmailLink from './EmailLink'
import {
  EmailIcon,
  GitHubIcon,
  LinkedInIcon,
  OrcidIcon,
  ScholarIcon,
} from './icons'
import './ProfileLinks.css'

interface ExternalIconLinkProps {
  href: string
  label: string
  children: ReactNode
}

function ExternalIconLink({ href, label, children }: ExternalIconLinkProps) {
  return (
    <a
      className="icon-link"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
    >
      {children}
      <span className="visually-hidden">{label} (opens in a new tab)</span>
    </a>
  )
}

// Icon links for email and the academic and social profiles.
// Anything that is null in content.ts is not shown.
export default function ProfileLinks() {
  const { email, scholar, github, linkedin, orcid } = content.links

  return (
    <ul className="profile-links" aria-label="Profiles">
      {email && (
        <li>
          <EmailLink className="icon-link">
            <EmailIcon />
            <span className="visually-hidden">Email</span>
          </EmailLink>
        </li>
      )}
      {scholar && (
        <li>
          <ExternalIconLink href={scholar} label="Google Scholar">
            <ScholarIcon />
          </ExternalIconLink>
        </li>
      )}
      {github && (
        <li>
          <ExternalIconLink href={github} label="GitHub">
            <GitHubIcon />
          </ExternalIconLink>
        </li>
      )}
      {linkedin && (
        <li>
          <ExternalIconLink href={linkedin} label="LinkedIn">
            <LinkedInIcon />
          </ExternalIconLink>
        </li>
      )}
      {orcid && (
        <li>
          <ExternalIconLink href={orcid} label="ORCID">
            <OrcidIcon />
          </ExternalIconLink>
        </li>
      )}
    </ul>
  )
}
