import { Fragment, type ReactNode } from 'react'
import ContactSection from './components/ContactSection'
import CvSection from './components/CvSection'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Research from './components/Research'
import Section from './components/Section'
import ThesisSection from './components/ThesisSection'
import { content } from './data/content'
import type { SectionId } from './data/types'
import { useActiveSection } from './hooks/useActiveSection'

const sectionIds = content.nav.map((item) => item.id)
const year = new Date().getFullYear()

// Sections that are built. Sections are shown in the order of content.nav, so the
// page order and the nav order always match.
const builtSections: Partial<Record<SectionId, ReactNode>> = {
  about: <Hero />,
  research: <Research />,
  thesis: <ThesisSection />,
  projects: <Projects />,
  cv: <CvSection />,
  contact: <ContactSection />,
}

// Which phase fills each section that is not built yet. Remove a line when built.
const placeholders: Partial<Record<SectionId, string>> = {
  blog: 'TODO: Blog list (Phase 12)',
}

function App() {
  const [activeId, activate] = useActiveSection(sectionIds)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Header activeId={activeId} onNavigate={activate} />
      <main id="main" tabIndex={-1}>
        {content.nav.map((item) => {
          const built = builtSections[item.id]
          return built ? (
            <Fragment key={item.id}>{built}</Fragment>
          ) : (
            <Section key={item.id} id={item.id} heading={item.heading}>
              <p className="placeholder">{placeholders[item.id]}</p>
            </Section>
          )
        })}
        <div id="page-end" aria-hidden="true" />
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>
            &copy; {year} {content.person.name}
          </p>
        </div>
      </footer>
    </>
  )
}

export default App
