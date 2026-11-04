import { content } from '../data/content'
import './Photo.css'

// Shows the photo from content.ts, or a neutral placeholder when there is none.
// Both take the same space, so adding the photo later causes no layout shift.
export default function Photo() {
  const { photo, shortName } = content.person

  if (photo) {
    return (
      <img
        className="photo"
        src={photo.src}
        alt={photo.alt}
        width={192}
        height={192}
        // Above the fold, so load it right away.
        fetchPriority="high"
      />
    )
  }

  // TODO: add photo. See the note next to `photo` in src/data/content.ts.
  return (
    <div className="photo photo--placeholder" aria-hidden="true">
      {shortName.charAt(0)}
    </div>
  )
}
