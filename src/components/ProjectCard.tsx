import { useId } from 'react'
import type { Project } from '../data/types'
import ExternalChip from './ExternalChip'
import './ProjectCard.css'

// One project card. A link that is null in content.ts is left out.
export default function ProjectCard({ project }: { project: Project }) {
  const titleId = useId()
  const { title, summary, tech, githubUrl, demoUrl } = project
  const hasLinks = githubUrl !== null || demoUrl !== null

  return (
    <article className="project-card" aria-labelledby={titleId}>
      <h3 id={titleId}>{title}</h3>
      <p className="project-card__summary">{summary}</p>
      {tech.length > 0 && (
        <ul className="project-card__tech" aria-label="Technologies used">
          {tech.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {hasLinks && (
        <div className="project-card__links">
          {githubUrl && <ExternalChip href={githubUrl} label="GitHub" />}
          {demoUrl && <ExternalChip href={demoUrl} label="Demo" />}
        </div>
      )}
    </article>
  )
}
