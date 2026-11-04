import { content } from '../data/content'
import PublicationList from './PublicationList'
import Section from './Section'
import Thesis from './Thesis'

export default function ThesisSection() {
  const nav = content.nav.find((item) => item.id === 'thesis')

  return (
    <Section id="thesis" heading={nav?.heading ?? 'Thesis and Publications'}>
      <Thesis />
      <PublicationList />
    </Section>
  )
}
