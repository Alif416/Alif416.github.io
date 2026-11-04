import { content } from '../data/content'
import ProjectCard from './ProjectCard'
import Section from './Section'
import './Projects.css'

export default function Projects() {
  const nav = content.nav.find((item) => item.id === 'projects')
  const { projects, projectsEmptyMessage } = content

  return (
    <Section id="projects" heading={nav?.heading ?? 'Projects'}>
      {projects.length === 0 ? (
        <p className="muted">{projectsEmptyMessage}</p>
      ) : (
        <ul className="project-grid">
          {projects.map((project) => (
            <li key={project.title}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
