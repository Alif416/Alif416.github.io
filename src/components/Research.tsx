import { content } from '../data/content'
import { useReveal } from '../hooks/useReveal'
import Section from './Section'
import Thesis from './Thesis'
import './Research.css'

// The Research section: the interests as a short list, then the thesis.
export default function Research() {
  const nav = content.nav.find((item) => item.id === 'research')
  const interests = content.research
  const { ref, visible } = useReveal<HTMLUListElement>()

  return (
    <Section id="research" heading={nav?.heading ?? 'Research'}>
      {interests.length > 0 && (
        <ul ref={ref} className={`research-list${visible ? ' is-visible' : ''}`} aria-label="Research interests">
          {interests.map((interest, index) => (
            <li key={interest} className="research-list__item" style={{ '--i': index } as React.CSSProperties}>
              {interest}
            </li>
          ))}
        </ul>
      )}
      <Thesis />
    </Section>
  )
}
