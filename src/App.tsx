import { Fragment, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import Blog from './components/Blog'
import ContactSection from './components/ContactSection'
import CvSection from './components/CvSection'
import Header from './components/Header'
import Hero from './components/Hero'
import PostPage from './components/PostPage'
import Projects from './components/Projects'
import Research from './components/Research'
import ThesisSection from './components/ThesisSection'
import { content } from './data/content'
import type { SectionId } from './data/types'
import { navItems, sectionIds } from './nav'
import { useActiveSection } from './hooks/useActiveSection'
import { getHomeScroll, jumpTo, parseRoute, useHash } from './router'

const year = new Date().getFullYear()

// Every section. Sections are shown in the order of content.nav (minus any that have
// nothing to show yet, see src/nav.ts), so the page order and the nav order always match.
const sections: Record<SectionId, ReactNode> = {
  about: <Hero />,
  research: <Research />,
  thesis: <ThesisSection />,
  projects: <Projects />,
  blog: <Blog />,
  cv: <CvSection />,
  contact: <ContactSection />,
}

// The skip link must not change the address (the address decides which page shows),
// so it moves focus to the main area directly.
const skipToMain = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault()
  document.getElementById('main')?.focus()
}

function App() {
  const route = parseRoute(useHash())
  const routeKey = route.name === 'post' ? `post:${route.slug}` : 'home'
  const onHome = route.name === 'home'
  const [activeId, activate] = useActiveSection(sectionIds, onHome)

  // Coming back from a post: the home page is rebuilt, so scroll to the section in the
  // address (for example #blog), or to where the reader was.
  const previousKey = useRef(routeKey)
  useLayoutEffect(() => {
    const cameFromPost = previousKey.current.startsWith('post:')
    previousKey.current = routeKey
    if (!onHome || !cameFromPost) return

    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
    if (target) target.scrollIntoView({ behavior: 'instant' })
    else jumpTo(getHomeScroll())
  }, [routeKey, onHome])

  return (
    <>
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>
      <Header activeId={activeId} onNavigate={activate} />
      <main id="main" tabIndex={-1}>
        {route.name === 'post' ? (
          <PostPage key={route.slug} slug={route.slug} />
        ) : (
          <>
            {navItems.map((item) => (
              <Fragment key={item.id}>{sections[item.id]}</Fragment>
            ))}
            <div id="page-end" aria-hidden="true" />
          </>
        )}
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
