import { content } from '../data/content'
import ExternalChip from './ExternalChip'
import './Thesis.css'

// The thesis block. Anything that is null in content.ts (abstract, links) is left out.
export default function Thesis() {
  const { title, supervisor, year, abstract, pdfUrl, codeUrl } = content.thesis
  const hasLinks = pdfUrl !== null || codeUrl !== null

  return (
    <article className="thesis" aria-labelledby="thesis-heading">
      <p className="thesis__label">Undergraduate thesis</p>
      <h3 id="thesis-heading">{title}</h3>
      <p className="thesis__meta">
        Supervised by {supervisor}, {year}
      </p>
      {abstract && <p className="thesis__abstract">{abstract}</p>}
      {hasLinks && (
        <div className="thesis__links">
          {pdfUrl && <ExternalChip href={pdfUrl} label="PDF" />}
          {codeUrl && <ExternalChip href={codeUrl} label="Code" />}
        </div>
      )}
    </article>
  )
}
