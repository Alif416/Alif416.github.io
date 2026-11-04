interface ExternalChipProps {
  href: string
  label: string
}

// A small outlined link (for example "PDF" or "Code") that opens in a new tab.
export default function ExternalChip({ href, label }: ExternalChipProps) {
  return (
    <a className="chip" href={href} target="_blank" rel="noopener noreferrer">
      {label}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}
