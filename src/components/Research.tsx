import { content } from '../data/content'
import { useReveal } from '../hooks/useReveal'
import Section from './Section'
import Papers from './Papers'
import './Research.css'

// The Research section: the thesis and papers timeline on the left, and the interests as sticky notes on the right.
export default function Research() {
  const nav = content.nav.find((item) => item.id === 'research')
  const interests = content.research
  const { ref, visible } = useReveal<HTMLUListElement>()

  return (
    <Section id="research" heading={nav?.heading ?? 'Research'}>
      <div className="research-layout">
        <Papers />
        {interests.length > 0 && (
          <div className="research-box">
            <h3 className="research-box__title">Research interests</h3>
            <ul ref={ref} className={`research-list${visible ? ' is-visible' : ''}`}>
              {interests.map((interest, index) => (
                <li key={interest} className="research-list__item" style={{ '--i': index } as React.CSSProperties}>
                  {interest}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  )
}
