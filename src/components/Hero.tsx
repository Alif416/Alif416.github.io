import { content } from '../data/content'
import DocumentButton from './DocumentButton'
import Photo from './Photo'
import ProfileLinks from './ProfileLinks'
import './Section.css'
import './Hero.css'

// The About section. Owns the page's single h1 (the name).
export default function Hero() {
  const { person, documents } = content

  return (
    <section id="about" className="section hero" aria-labelledby="about-title">
      <div className="container hero__inner">
        <div className="hero__text">
          <h1 id="about-title">{person.name}</h1>
          <p className="hero__headline">{person.headline}</p>
          <p className="hero__statement">{person.researchStatement}</p>

          <div className="hero__actions">
            <div className="hero__buttons">
              <DocumentButton
                url={documents.cv.url}
                label={documents.cv.label}
                variant="primary"
              />
              <DocumentButton
                url={documents.transcript.url}
                label={documents.transcript.label}
                variant="secondary"
              />
            </div>
            <ProfileLinks />
          </div>

          <p className="hero__bio">{person.bio}</p>
        </div>

        <div className="hero__photo">
          <Photo />
        </div>
      </div>
    </section>
  )
}
