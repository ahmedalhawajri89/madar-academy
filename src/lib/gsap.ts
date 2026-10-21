import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, ScrambleTextPlugin, useGSAP)
gsap.defaults({ ease: 'power3.out', duration: 0.8 })

/** Shared media queries for gsap.matchMedia() — every animation respects reduced motion. */
export const MQ = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  finePointer: '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
} as const

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(MQ.reduce).matches

export { gsap, ScrollTrigger, SplitText, Flip, DrawSVGPlugin, useGSAP }
