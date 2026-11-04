interface DocumentButtonProps {
  url: string
  label: string
  variant: 'primary' | 'secondary'
}

// A link styled as a button that opens a document (a Google Drive link) in a new tab.
export default function DocumentButton({ url, label, variant }: DocumentButtonProps) {
  return (
    <a
      className={`button button--${variant}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}
