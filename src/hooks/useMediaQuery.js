import { useEffect, useState } from 'react'

/**
 * Suscribe a una media query. Usa el breakpoint `md` de Tailwind (768px) vía useIsMobile.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)
    setMatches(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Viewports menores al breakpoint `md` (767px o menos). */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)')
}
