import { useEffect, useRef, useState } from 'react'

/**
 * Tells a list item when it has scrolled into view, once. Without IntersectionObserver, or
 * when the visitor prefers reduced motion, the item counts as visible straight away.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!el || reduced || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}
