import { content } from '../data/content'
import './Photo.css'

// Shows the photo from content.ts, or a neutral placeholder when there is none.
// Both take the same space, so adding the photo later causes no layout shift.
export default function Photo() {
  const { photo, shortName } = content.person

  if (photo) {
    const image = (
      <img
        className="photo"
        src={photo.src}
        srcSet={photo.srcSet}
        // The photo is 192 pixels wide from tablet width up, and 112 pixels on phones.
        sizes={photo.srcSet ? '(min-width: 768px) 192px, 112px' : undefined}
        alt={photo.alt}
        width={192}
        height={192}
        // Above the fold, so load it right away.
        fetchPriority="high"
      />
    )

    // With other formats, the browser picks the first one it can use.
    if (!photo.sources || photo.sources.length === 0) return image
    return (
      <picture className="photo-picture">
        {photo.sources.map((source) => (
          <source
            key={source.type}
            type={source.type}
            srcSet={source.srcSet}
            sizes="(min-width: 768px) 192px, 112px"
          />
        ))}
        {image}
      </picture>
    )
  }

  // TODO: add photo. See the note next to `photo` in src/data/content.ts.
  return (
    <div className="photo photo--placeholder" aria-hidden="true">
      {shortName.charAt(0)}
    </div>
  )
}
