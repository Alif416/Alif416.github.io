import { content } from '../data/content'
import type { Project } from '../data/types'
import { useReveal } from '../hooks/useReveal'
import ProjectCard from './ProjectCard'
import Section from './Section'
import './Projects.css'

function TimelineItem({ project }: { project: Project }) {
  const { ref, visible } = useReveal<HTMLLIElement>()
  return (
    <li ref={ref} className={`timeline__item${visible ? ' is-visible' : ''}`}>
      {project.date && <p className="timeline__date">{project.date}</p>}
      <ProjectCard project={project} />
    </li>
  )
}

export default function Projects() {
  const nav = content.nav.find((item) => item.id === 'projects')
  const { projects, projectsEmptyMessage } = content

  return (
    <Section id="projects" heading={nav?.heading ?? 'Projects'}>
      {projects.length === 0 ? (
        <p className="muted">{projectsEmptyMessage}</p>
      ) : (
        <ol className="timeline">
          {projects.map((project) => (
            <TimelineItem key={project.title} project={project} />
          ))}
        </ol>
      )}
    </Section>
  )
}
