import { content } from '../data/content'
import ContactLinks from './ContactLinks'
import EmailAddress from './EmailAddress'
import Section from './Section'
import './ContactSection.css'

const hasAnyLink = (): boolean => {
  const { scholar, github, linkedin, orcid } = content.links
  return [scholar, github, linkedin, orcid].some((value) => value !== null)
}

export default function ContactSection() {
  const nav = content.nav.find((item) => item.id === 'contact')
  const { intro } = content.contact
  const { email } = content.links
  const nothingToShow = !intro && !email && !hasAnyLink()

  return (
    <Section id="contact" heading={nav?.heading ?? 'Contact'}>
      {nothingToShow ? (
        <p className="muted">Contact details are being added.</p>
      ) : (
        <div className="contact">
          {intro && <p className="contact__intro">{intro}</p>}
          {email && (
            <p className="contact__email">
              <span className="contact__label">Email</span>
              <EmailAddress />
            </p>
          )}
          <ContactLinks />
        </div>
      )}
    </Section>
  )
}
