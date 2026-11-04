import { content } from '../data/content'
import type { Milestone } from '../data/types'
import { useReveal } from '../hooks/useReveal'
import ExternalChip from './ExternalChip'
import './Thesis.css'

function MilestoneItem({ milestone }: { milestone: Milestone }) {
  const { ref, visible } = useReveal<HTMLLIElement>()
  return (
    <li ref={ref} className={`milestones__item${visible ? ' is-visible' : ''}`}>
      {milestone.date && <span className="milestones__date">{milestone.date}</span>}
      {milestone.label}
    </li>
  )
}

// The thesis block. Anything that is null or empty in content.ts (abstract, links,
// milestones) is left out.
export default function Thesis() {
  const { title, supervisor, year, abstract, pdfUrl, codeUrl, milestones } = content.thesis
  const hasLinks = pdfUrl !== null || codeUrl !== null

  return (
    <article className="thesis" aria-labelledby="thesis-heading">
      <p className="thesis__label">Undergraduate thesis</p>
      <h3 id="thesis-heading">{title}</h3>
      <p className="thesis__meta">
        Supervised by {supervisor}, {year}
      </p>
      {abstract && <p className="thesis__abstract">{abstract}</p>}
      {milestones.length > 0 && (
        <ol className="milestones" aria-label="Thesis milestones">
          {milestones.map((milestone) => (
            <MilestoneItem key={milestone.label} milestone={milestone} />
          ))}
        </ol>
      )}
      {hasLinks && (
        <div className="thesis__links">
          {pdfUrl && <ExternalChip href={pdfUrl} label="PDF" />}
          {codeUrl && <ExternalChip href={codeUrl} label="Code" />}
        </div>
      )}
    </article>
  )
}
