const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

// "2026-03-01" -> "1 March 2026"
export const readableDate = (date: string): string =>
  dateFormat.format(new Date(`${date}T00:00:00Z`))
