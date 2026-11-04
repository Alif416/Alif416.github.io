import { content } from '../data/content'
import DocumentButton from './DocumentButton'
import './CvSection.css'

// CV and Transcript links. The "last updated" line only shows when a real date
// is set in content.ts (documents.cv.lastUpdated). It is never filled in automatically.
export default function Documents() {
  const { cv, transcript } = content.documents

  return (
    <div className="cv-block">
      <h3>Documents</h3>
      <ul className="documents">
        <li>
          <DocumentButton url={cv.url} label={cv.label} variant="primary" />
          {cv.lastUpdated && (
            <p className="documents__updated">Last updated {cv.lastUpdated}</p>
          )}
        </li>
        <li>
          <DocumentButton
            url={transcript.url}
            label={transcript.label}
            variant="secondary"
          />
        </li>
      </ul>
    </div>
  )
}
