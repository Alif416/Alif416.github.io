import { useEmailAddress } from '../hooks/useEmailAddress'

// The email address as readable, selectable text that is also a mailto: link.
export default function EmailAddress({ className }: { className?: string }) {
  const address = useEmailAddress()

  if (!address) return null

  return (
    <a className={className} href={`mailto:${address}`}>
      {address}
    </a>
  )
}
