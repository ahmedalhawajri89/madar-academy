import { useRef } from 'react'
import { useLang } from '../../i18n/LangContext'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { onIntro } from '../../lib/intro'

/**
 * Film-style chapter marker on the side of wide screens: «04 / 12 — الدورات».
 * The number scrambles, the title rolls in the scroll direction, and a thin
 * reel line tracks overall progress. Decorative (the nav carries the semantics).
 */
export function ChapterHUD() {
  const { t } = useLang()
  const chapters = t.chapters
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1360px)', () => {
        const root = ref.current!
        const num = root.querySelector<HTMLElement>('.hud-num')!
        const title = root.querySelector<HTMLElement>('.hud-title')!
        const fill = root.querySelector<HTMLElement>('.hud-fill')!
        const reduced = prefersReducedMotion()
        let current = -1

        const show = (i: number) => {
          if (i === current) return
          const down = i > current
          current = i
          const n = String(i + 1).padStart(2, '0')
          if (reduced) {
            num.textContent = n
            title.textContent = chapters[i].label
            return
          }
          gsap.to(num, { duration: 0.7, scrambleText: { text: n, chars: '0123456789', speed: 0.6 }, overwrite: true })
          gsap
            .timeline()
            .to(title, { yPercent: down ? -100 : 100, autoAlpha: 0, duration: 0.25, ease: 'power2.in', overwrite: true })
            .call(() => {
              title.textContent = chapters[i].label
            })
            .fromTo(title, { yPercent: down ? 100 : -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'madar.out' })
        }

        // Active chapter = the last section whose top has crossed the middle of the screen.
        // Read from live positions (not enter/leave events) so big jumps never leave it stale.
        const sections = chapters.map((c) => document.getElementById(c.id))
        const sync = () => {
          const mid = window.innerHeight / 2
          let idx = 0
          sections.forEach((s, i) => {
            if (s && s.getBoundingClientRect().top <= mid) idx = i
          })
          show(idx)
        }
        ScrollTrigger.create({
          start: 0,
          end: 'max',
          refreshPriority: -1, // after the pinned scenes have been measured
          onRefresh: sync,
          onUpdate: (self) => {
            gsap.set(fill, { scaleY: self.progress })
            sync()
          },
        })

        show(0)
        if (!reduced) {
          gsap.set(root, { autoAlpha: 0 })
          return onIntro(() => gsap.to(root, { autoAlpha: 1, duration: 1, delay: 1.6 }))
        }
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed end-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 text-paper mix-blend-difference min-[1360px]:flex"
    >
      <span className="font-mono text-xs tracking-[0.2em]" dir="ltr">
        <span className="hud-num">01</span>
        <span className="opacity-50"> / {String(chapters.length).padStart(2, '0')}</span>
      </span>
      <span className="relative h-36 w-px overflow-hidden bg-paper/25">
        <span className="hud-fill absolute inset-0 origin-top bg-paper" style={{ transform: 'scaleY(0)' }} />
      </span>
      <span className="block w-24 overflow-hidden text-center">
        <span className="hud-title block whitespace-nowrap font-display text-xs font-semibold">{chapters[0].label}</span>
      </span>
    </div>
  )
}
