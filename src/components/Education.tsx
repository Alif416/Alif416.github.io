import { content } from '../data/content'
import './CvSection.css'

// Degree summary, read from content.education.
export default function Education() {
  const { university, degree, batch, cgpa } = content.education

  return (
    <div className="cv-block">
      <h3>Education</h3>
      <p className="cv-block__strong">{university}</p>
      <p>{degree}</p>
      <p className="cv-block__muted">
        {batch} batch, CGPA {cgpa}
      </p>
    </div>
  )
}
