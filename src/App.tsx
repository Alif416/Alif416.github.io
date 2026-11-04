import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Research from './components/Research'
import Section from './components/Section'
import ThesisSection from './components/ThesisSection'
import { content } from './data/content'
import { useActiveSection } from './hooks/useActiveSection'

const sectionIds = content.nav.map((item) => item.id)
const year = new Date().getFullYear()

// Which phase fills each section. Remove a line when its section is built.
const placeholders: Record<string, string> = {
  blog: 'TODO: Blog list (Phase 12)',
  cv: 'TODO: CV, transcript, and education (Phase 10)',
  contact: 'TODO: Contact details (Phase 11)',
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
        <Hero />
        <Research />
        <ThesisSection />
        <Projects />
        {content.nav
          .filter((item) => !['about', 'research', 'thesis', 'projects'].includes(item.id))
          .map((item) => (
            <Section key={item.id} id={item.id} heading={item.heading}>
              <p className="placeholder">{placeholders[item.id]}</p>
            </Section>
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
