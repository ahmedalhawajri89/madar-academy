import type { RefObject } from 'react'
import { gsap, MQ, ScrollTrigger, SplitText, useGSAP } from '../lib/gsap'

/**
 * Shared scroll motion for a section (the site's "motion grammar"):
 *  - [data-split]          → headline revealed line by line (words split, lines masked — safe for Arabic joining)
 *  - [data-reveal]         → soft rise when it enters the viewport
 *  - [data-reveal-group]   → its direct children stagger in
 *  - [data-mask]           → image wipes open from the bottom; [data-mask-inner] settles from a zoom
 *  - section[data-expand]  → dark scene grows from an inset rounded card to full bleed while it enters
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
        const y = desktop ? 36 : 20

        if (root.hasAttribute('data-expand')) {
          const inset = desktop ? '7% 5% 0% 5%' : '3% 3% 0% 3%'
          gsap.fromTo(
            root,
            { clipPath: `inset(${inset} round 48px)` },
            {
              clipPath: 'inset(0% 0% 0% 0% round 0px)',
              ease: 'none',
              scrollTrigger: { trigger: root, start: 'top bottom', end: 'top 20%', scrub: true },
            },
          )
        }

        root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
          SplitText.create(el, {
            type: 'words,lines',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1.2,
                stagger: 0.1,
                ease: 'madar.out',
                scrollTrigger: { trigger: el, start: 'top 88%', once: true },
              }),
          })
        })

        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y,
            autoAlpha: 0,
            duration: 1,
            ease: 'madar.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        })

        root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
          gsap.from(group.children, {
            y: y * 1.4,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.09,
            ease: 'madar.out',
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          })
        })

        const masks = gsap.utils.toArray<HTMLElement>('[data-mask]', root)
        if (masks.length) {
          gsap.set(masks, { clipPath: 'inset(100% 0% 0% 0%)' })
          ScrollTrigger.batch(masks, {
            start: 'top 88%',
            once: true,
            onEnter: (batch) => {
              gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, stagger: 0.12, ease: 'madar.inOut' })
              gsap.fromTo(
                batch.map((m) => m.querySelector('[data-mask-inner]')).filter(Boolean),
                { scale: 1.3 },
                { scale: 1, duration: 1.6, stagger: 0.12, ease: 'madar.out' },
              )
            },
          })
        }
      })

      return () => mm.revert()
    },
    { scope },
  )
}
