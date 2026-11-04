import { content } from '../data/content'
import Documents from './Documents'
import Education from './Education'
import Section from './Section'
import './CvSection.css'

export default function CvSection() {
  const nav = content.nav.find((item) => item.id === 'cv')

  return (
    <Section id="cv" heading={nav?.heading ?? 'CV and Transcript'}>
      <div className="cv-section">
        <Education />
        <Documents />
      </div>
    </Section>
  )
}
