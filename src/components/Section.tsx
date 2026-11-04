import type { ReactNode } from 'react'
import './Section.css'

interface SectionProps {
  id: string
  heading: string
  // The page has one h1 (the name in the About section). Every other heading is an h2.
  level?: 1 | 2
  children?: ReactNode
}

export default function Section({ id, heading, level = 2, children }: SectionProps) {
  const titleId = `${id}-title`
  const Heading = level === 1 ? 'h1' : 'h2'

  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <div className="container">
        <Heading id={titleId}>{heading}</Heading>
        {children}
      </div>
    </section>
  )
}
