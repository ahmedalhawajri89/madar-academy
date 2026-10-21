import type { RefObject } from 'react'
import { gsap, MQ, SplitText, useGSAP } from '../lib/gsap'

/**
 * Shared scroll motion for a section:
 *  - [data-split]          → headline revealed line by line (words split, lines masked — safe for Arabic joining)
 *  - [data-reveal]         → soft fade-up when it enters the viewport
 *  - [data-reveal-group]   → its direct children stagger in
 * Content is fully visible without JS and under prefers-reduced-motion.
 */
export function useSectionMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()

      mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean }
        const y = desktop ? 32 : 18

        root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
          SplitText.create(el, {
            type: 'words,lines',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1.1,
                stagger: 0.09,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
              }),
          })
        })

        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y,
            autoAlpha: 0,
            duration: 0.9,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        })

        root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
          gsap.from(group.children, {
            y: y * 1.4,
            autoAlpha: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          })
        })
      })

      return () => mm.revert()
    },
    { scope },
  )
}
