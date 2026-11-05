import { useEffect, useRef, useState } from 'react'
import { content } from '../data/content'
import type { Project } from '../data/types'
import { useReveal } from '../hooks/useReveal'
import ProjectCard from './ProjectCard'
import Section from './Section'
import './Projects.css'

type ItemProps = {
  project: Project
  active: boolean
  setRef: (element: HTMLLIElement | null) => void
}

function TimelineItem({ project, active, setRef }: ItemProps) {
  const { ref, visible } = useReveal<HTMLLIElement>()
  return (
    <li
      ref={(element) => {
        ref.current = element
        setRef(element)
      }}
      className={`timeline__item${visible ? ' is-visible' : ''}${active ? ' is-active' : ''}`}
    >
      {project.date && <p className="timeline__date">{project.date}</p>}
      <ProjectCard project={project} />
    </li>
  )
}

// One dot travels down the line as the page scrolls, and the project it reaches is
// highlighted. With reduced motion the dot jumps from project to project instead of gliding.
function Timeline({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const items = useRef<(HTMLLIElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const list = listRef.current
    const dot = dotRef.current
    if (!list || !dot) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const state = { frame: 0, current: -1 }

    const update = () => {
      state.frame = 0
      const rows = items.current.filter((item): item is HTMLLIElement => item !== null)
      if (rows.length === 0) return
      // The height of the first line of each item (its date, or the card top) places the dot.
      const anchors = rows.map((row) => row.offsetTop + (row.firstElementChild as HTMLElement).offsetHeight / 2)
      const target = window.innerHeight * 0.45 - list.getBoundingClientRect().top
      const clamped = Math.min(Math.max(target, anchors[0]), anchors[anchors.length - 1])
      let nearest = 0
      anchors.forEach((anchor, index) => {
        if (Math.abs(anchor - clamped) < Math.abs(anchors[nearest] - clamped)) nearest = index
      })
      const y = reduced ? anchors[nearest] : clamped
      dot.style.transform = `translateY(${y - dot.offsetHeight / 2}px)`
      if (nearest !== state.current) {
        state.current = nearest
        setActive(nearest)
      }
    }
    const schedule = () => {
      if (!state.frame) state.frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (state.frame) cancelAnimationFrame(state.frame)
    }
  }, [projects.length])

  return (
    <div ref={listRef} className="timeline">
      <span ref={dotRef} className="timeline__dot" aria-hidden="true" />
      <ol className="timeline__list">
      {projects.map((project, index) => (
        <TimelineItem
          key={project.title}
          project={project}
          active={index === active}
          setRef={(element) => {
            items.current[index] = element
          }}
        />
      ))}
      </ol>
    </div>
  )
}

export default function Projects() {
  const nav = content.nav.find((item) => item.id === 'projects')
  const { projects, projectsEmptyMessage } = content

  return (
    <Section id="projects" heading={nav?.heading ?? 'Projects'}>
      {projects.length === 0 ? <p className="muted">{projectsEmptyMessage}</p> : <Timeline projects={projects} />}
    </Section>
  )
}
