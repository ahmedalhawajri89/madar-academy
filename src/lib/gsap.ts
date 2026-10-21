import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, ScrambleTextPlugin, CustomEase, MotionPathPlugin, useGSAP)

/**
 * Motion language of the site — one family of curves so every scene "feels" the same:
 *  madar.out    → confident arrival (long, soft landing)
 *  madar.inOut  → cinematic cuts, curtains and wipes
 */
CustomEase.create('madar.out', 'M0,0 C0.16,1 0.3,1 1,1')
CustomEase.create('madar.inOut', 'M0,0 C0.76,0 0.24,1 1,1')

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
