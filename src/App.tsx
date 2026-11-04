import { Fragment, type ReactNode } from 'react'
import Blog from './components/Blog'
import ContactSection from './components/ContactSection'
import CvSection from './components/CvSection'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Research from './components/Research'
import ThesisSection from './components/ThesisSection'
import { content } from './data/content'
import type { SectionId } from './data/types'
import { useActiveSection } from './hooks/useActiveSection'

const sectionIds = content.nav.map((item) => item.id)
const year = new Date().getFullYear()

// Every section. Sections are shown in the order of content.nav, so the
// page order and the nav order always match.
const sections: Record<SectionId, ReactNode> = {
  about: <Hero />,
  research: <Research />,
  thesis: <ThesisSection />,
  projects: <Projects />,
  blog: <Blog />,
  cv: <CvSection />,
  contact: <ContactSection />,
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
        {content.nav.map((item) => (
          <Fragment key={item.id}>{sections[item.id]}</Fragment>
        ))}
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
