import { content } from '../data/content'
import ExternalChip from './ExternalChip'
import './PublicationList.css'

// Publications. Shows nothing at all when there are none, so the page never
// suggests work that does not exist. Newest first.
export default function PublicationList() {
  const { publications, manuscriptsInPreparation, person } = content

  if (publications.length === 0 && !manuscriptsInPreparation) return null

  const sorted = [...publications].sort((a, b) => b.year - a.year)

  return (
    <div className="publications">
      <h3>Publications</h3>
      {manuscriptsInPreparation && (
        <p className="publications__note">Manuscripts in preparation.</p>
      )}
      {sorted.length > 0 && (
        <ul className="publications__list">
          {sorted.map((pub) => {
            const links = [
              { href: pub.pdfUrl, label: 'PDF' },
              { href: pub.arxivUrl, label: 'arXiv' },
              { href: pub.codeUrl, label: 'Code' },
              { href: pub.slidesUrl, label: 'Slides' },
            ].filter((link): link is { href: string; label: string } => link.href !== null)

            return (
              <li key={`${pub.title}-${pub.year}`} className="publications__item">
                <p className="publications__title">{pub.title}</p>
                <p className="publications__meta">
                  {pub.authors.map((author, index) => (
                    <span key={author}>
                      {index > 0 && ', '}
                      {author === person.name ? <strong>{author}</strong> : author}
                    </span>
                  ))}
                  . {pub.venue}, {pub.year}.
                </p>
                {links.length > 0 && (
                  <div className="publications__links">
                    {links.map((link) => (
                      <ExternalChip key={link.label} href={link.href} label={link.label} />
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
