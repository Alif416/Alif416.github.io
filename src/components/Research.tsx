import { content } from '../data/content'
import Section from './Section'
import './Research.css'

// The Research section. Everything shown comes from `content.research` in content.ts.
export default function Research() {
  const nav = content.nav.find((item) => item.id === 'research')
  const interests = content.research

  return (
    <Section id="research" heading={nav?.heading ?? 'Research'}>
      {interests.length === 0 ? (
        <p className="placeholder">TODO: Add research interests in src/data/content.ts</p>
      ) : (
        <ul className="research-list">
          {interests.map((interest) => (
            <li key={interest.title} className="research-list__item">
              <h3>{interest.title}</h3>
              <p>{interest.description}</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
