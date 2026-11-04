import { content } from '../data/content'
import type { Paper } from '../data/types'
import { useReveal } from '../hooks/useReveal'
import ExternalChip from './ExternalChip'
import './Papers.css'

function PaperItem({ paper }: { paper: Paper }) {
  const { ref, visible } = useReveal<HTMLLIElement>()
  const { kind, title, meta, date, abstract, pdfUrl, codeUrl } = paper
  const hasLinks = pdfUrl !== null || codeUrl !== null

  return (
    <li ref={ref} className={`papers__item${visible ? ' is-visible' : ''}`}>
      <article>
        <p className="papers__label">
          {kind}
          {date && <span className="papers__date">{date}</span>}
        </p>
        <h3>{title}</h3>
        <p className="papers__meta">{meta}</p>
        {abstract && <p className="papers__abstract">{abstract}</p>}
        {hasLinks && (
          <div className="papers__links">
            {pdfUrl && <ExternalChip href={pdfUrl} label="PDF" />}
            {codeUrl && <ExternalChip href={codeUrl} label="Code" />}
          </div>
        )}
      </article>
    </li>
  )
}

// The thesis and papers as a vertical timeline, one dot for each. Anything that is null in
// content.ts (date, abstract, links) is left out.
export default function Papers() {
  const { papers } = content
  if (papers.length === 0) return null

  return (
    <ol className="papers" aria-label="Thesis and papers">
      {papers.map((paper) => (
        <PaperItem key={paper.title} paper={paper} />
      ))}
    </ol>
  )
}
