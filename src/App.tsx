import Header from './components/Header'
import Section from './components/Section'
import { content } from './data/content'
import { useActiveSection } from './hooks/useActiveSection'

const sectionIds = content.nav.map((item) => item.id)
const year = new Date().getFullYear()

// Which phase fills each section. Remove a line when its section is built.
const placeholders: Record<string, string> = {
  about: 'TODO: Hero and bio (Phase 6)',
  research: 'TODO: Research interests (Phase 7)',
  thesis: 'TODO: Thesis and publications (Phase 8)',
  projects: 'TODO: Project cards (Phase 9)',
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
        {content.nav.map((item) => (
          <Section
            key={item.id}
            id={item.id}
            heading={item.heading}
            level={item.id === 'about' ? 1 : 2}
          >
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
