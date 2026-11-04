import ThemeToggle from './components/ThemeToggle'
import { content } from './data/content'

// Temporary sample page so the theme can be checked. Phase 5 replaces this with the real shell.
function App() {
  const { person, links } = content

  return (
    <>
      <header style={{ padding: 'var(--space-3) var(--gutter)', textAlign: 'right' }}>
        <ThemeToggle />
      </header>
      <main style={{ maxWidth: 'var(--measure)', margin: '0 auto', padding: '0 var(--gutter) var(--space-7)' }}>
        <h1>{person.name}</h1>
        <p className="muted" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
          {person.headline}
        </p>
        <p>{person.bio}</p>
        {links.github && (
          <p>
            <a href={links.github}>GitHub</a>
          </p>
        )}
      </main>
    </>
  )
}

export default App
