import { useEffect, useRef, useState } from 'react'
import { content } from '../data/content'
import { navItems } from '../nav'
import ThemeToggle from './ThemeToggle'
import './Header.css'

interface HeaderProps {
  activeId: string | null
  onNavigate: (id: string) => void
}

const MENU_ID = 'site-menu'

export default function Header({ activeId, onNavigate }: HeaderProps) {
  const { person } = content
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Show a bottom border once the page has scrolled (no scroll handler needed).
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) =>
      setScrolled(!entry.isIntersecting),
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // In the page order the menu links come before the menu button, so when the menu opens,
  // move focus to its first link. Otherwise Tab would skip past the menu.
  useEffect(() => {
    if (open) listRef.current?.querySelector('a')?.focus()
  }, [open])

  // Close the menu with Escape (and return focus to the button) or a click outside.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  // Reset the menu when the window grows to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 48rem)')
    const onChange = () => {
      if (query.matches) setOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Close when keyboard focus leaves the header.
  const onBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpen(false)
    }
  }

  return (
    <>
      <div ref={sentinelRef} className="header-sentinel" aria-hidden="true" />
      <header
        ref={headerRef}
        className={`site-header${scrolled ? ' is-scrolled' : ''}`}
        onBlur={onBlur}
      >
        <div className="container site-header__inner">
          <a className="site-header__brand" href="#about">
            {person.name}
          </a>

          <nav className="site-nav" aria-label="Main">
            <ul
              ref={listRef}
              id={MENU_ID}
              className={`site-nav__list${open ? ' is-open' : ''}`}
            >
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={activeId === item.id ? 'true' : undefined}
                    onClick={() => {
                      onNavigate(item.id)
                      setOpen(false)
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <ThemeToggle />
            <button
              ref={buttonRef}
              type="button"
              className="menu-button"
              aria-expanded={open}
              aria-controls={MENU_ID}
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((value) => !value)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
