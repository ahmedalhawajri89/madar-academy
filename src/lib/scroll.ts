import type Lenis from 'lenis'
import { prefersReducedMotion } from './gsap'

let lenis: Lenis | null = null

export const setLenis = (instance: Lenis | null) => {
  lenis = instance
}

const NAV_OFFSET = -88

export function scrollToId(id: string) {
  const el = id === 'top' ? document.body : document.getElementById(id)
  if (!el) return
  if (lenis) {
    lenis.scrollTo(id === 'top' ? 0 : el, { offset: NAV_OFFSET, duration: 1.4 })
  } else {
    const y = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY + NAV_OFFSET
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

export const lockScroll = (locked: boolean) => {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
