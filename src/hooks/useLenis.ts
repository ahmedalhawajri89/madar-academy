import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/gsap'
import { setLenis } from '../lib/scroll'

/** Smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in perfect sync. Disabled for reduced motion. */
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Re-measure every trigger once web fonts and images have settled.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => window.removeEventListener('load', refresh)
  }, [])
}
