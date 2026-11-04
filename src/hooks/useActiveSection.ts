import { useCallback, useEffect, useRef, useState } from 'react'

// How long a clicked link keeps the highlight while the page scrolls to the section.
const SETTLE_MS = 1200

// Returns the id of the section currently in view, plus a function to call when a
// nav link is clicked.
//
// A clicked link keeps the highlight after the jump, even if the page cannot scroll
// far enough to put that section at the top (short sections near the bottom of the
// page would otherwise make the last link win). The hold ends as soon as the clicked
// section leaves the screen or a different section comes into view.
//
// Uses IntersectionObserver only (no scroll handlers).
// Expects an element with id="page-end" after the last section.
export function useActiveSection(
  ids: string[],
): [string | null, (id: string) => void] {
  const [active, setActive] = useState<string | null>(null)
  const forced = useRef<string | null>(null)
  const startHold = useRef<() => void>(() => {})

  const activate = useCallback((id: string) => {
    forced.current = id
    setActive(id)
    startHold.current()
  }, [])

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0 || !('IntersectionObserver' in window)) return

    const inBand = new Set<string>()
    const atBottom = { current: false }
    const hold: {
      snapshot: string | null
      timer: ReturnType<typeof setTimeout> | undefined
    } = { snapshot: null, timer: undefined }

    const state = () => `${[...inBand].sort().join(',')}|${atBottom.current}`

    const compute = () => {
      if (atBottom.current && window.scrollY > 0) {
        setActive(ids[ids.length - 1])
        return
      }
      const current = ids.filter((id) => inBand.has(id)).pop()
      if (current) setActive(current)
    }

    const release = () => {
      forced.current = null
      hold.snapshot = null
      clearTimeout(hold.timer)
    }

    const update = () => {
      if (forced.current) {
        // Still settling, or nothing has changed since the jump finished.
        if (hold.snapshot === null || state() === hold.snapshot) return
        release()
      }
      compute()
    }

    startHold.current = () => {
      clearTimeout(hold.timer)
      hold.snapshot = null
      hold.timer = setTimeout(() => {
        const target = forced.current && document.getElementById(forced.current)
        const rect = target ? target.getBoundingClientRect() : null
        const onScreen = rect !== null && rect.bottom > 0 && rect.top < window.innerHeight
        if (onScreen) {
          hold.snapshot = state()
        } else {
          release()
          compute()
        }
      }, SETTLE_MS)
    }

    // A section counts as "in view" while it crosses a band just under the header.
    const band = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        update()
      },
      { rootMargin: '-96px 0px -60% 0px' },
    )
    elements.forEach((el) => band.observe(el))

    // The last section can be too short to reach the band, so also watch the page end.
    const end = document.getElementById('page-end')
    const bottom = end
      ? new IntersectionObserver(([entry]) => {
          atBottom.current = entry.isIntersecting
          update()
        })
      : null
    if (end && bottom) bottom.observe(end)

    return () => {
      band.disconnect()
      bottom?.disconnect()
      clearTimeout(hold.timer)
    }
  }, [ids])

  return [active, activate]
}
