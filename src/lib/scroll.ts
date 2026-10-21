import type Lenis from 'lenis'
import { prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}

const NAV_OFFSET = -88

const targetY = (id: string) => {
  if (id === 'top') return 0
  const el = document.getElementById(id)
  return el ? el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET : null
}

/** Smooth scroll to a section. */
export function scrollToId(id: string) {
  const y = targetY(id)
  if (y === null) return
  if (lenis) lenis.scrollTo(y, { duration: 1.4 })
  else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** Instant jump — used behind a full-screen cover (title card, mobile menu). */
export function jumpToId(id: string) {
  const y = targetY(id)
  if (y === null) return
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
  else window.scrollTo({ top: y, behavior: 'auto' })
}

export const lockScroll = (locked: boolean) => {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
