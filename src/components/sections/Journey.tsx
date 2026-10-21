import { useRef } from 'react'
import { Award, CalendarCheck, Compass, Hammer } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { gsap, MQ, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { SectionHeading } from '../ui/SectionHeading'

const icons = [Compass, CalendarCheck, Hammer, Award]
/** Node positions on the wave (x as % of width from the inline-start edge, y in px of the 200px band). */
const nodes = [
  { x: 12.5, y: 50 },
  { x: 37.5, y: 150 },
  { x: 62.5, y: 50 },
  { x: 87.5, y: 150 },
]
const WAVE = 'M0 100 C 60 100, 70 50, 125 50 S 300 150, 375 150 S 550 50, 625 50 S 800 150, 875 150 S 970 100, 1000 100'

export function Journey() {
  const { t } = useLang()
  const j = t.journey
  const ref = useRef<HTMLElement>(null)
  useSectionMotion(ref)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const setActive = (selector: string, count: number) => {
        const els = gsap.utils.toArray<HTMLElement>(selector)
        els.forEach((el, i) => el.classList.toggle('is-active', i < count))
      }

      // Desktop: the wave draws with scroll; each step lights up as the line reaches it.
      mm.add(MQ.desktop, () => {
        gsap.fromTo(
          '.wave-path',
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: '.wave-band',
              start: 'top 75%',
              end: 'bottom 30%',
              scrub: 0.8,
              onUpdate: (self) => {
                const reached = nodes.filter((n) => self.progress >= n.x / 100 - 0.02).length
                setActive('.journey-desktop .journey-node', reached)
                setActive('.journey-desktop .journey-card', reached)
              },
            },
          },
        )
      })

      // Mobile: vertical progress line + per-step activation
      mm.add(MQ.mobile, () => {
        gsap.fromTo('.v-progress', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.journey-mobile', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } })
        gsap.utils.toArray<HTMLElement>('.journey-mobile li').forEach((li) => {
          ScrollTrigger.create({
            trigger: li,
            start: 'top 65%',
            onToggle: (self) => {
              li.querySelector('.journey-node')?.classList.toggle('is-active', self.isActive || self.progress > 0)
              li.querySelector('.journey-card')?.classList.toggle('is-active', self.isActive || self.progress > 0)
            },
            end: 'max',
          })
        })
      })

      // Reduced motion: everything is simply active.
      mm.add(MQ.reduce, () => {
        setActive('.journey-node', 99)
        setActive('.journey-card', 99)
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={j.eyebrow} title={j.title} align="center" />

        {/* Desktop wave */}
        <div className="journey-desktop mt-20 hidden lg:block">
          <div className="wave-band relative h-[200px]">
            <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-0 size-full rtl:-scale-x-100" aria-hidden>
              <path d={WAVE} fill="none" stroke="#DCD3BF" strokeWidth="2" strokeDasharray="6 8" vectorEffect="non-scaling-stroke" />
              <path className="wave-path" d={WAVE} fill="none" stroke="#16463A" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {nodes.map((n, i) => {
              const Icon = icons[i]
              return (
                <div key={i} className="absolute flex h-0 w-0 items-center justify-center" style={{ insetInlineStart: `${n.x}%`, top: n.y }}>
                  <span className="journey-node grid size-16 shrink-0 place-items-center rounded-full border-2 border-line bg-paper text-pine">
                    <Icon className="size-6" aria-hidden />
                  </span>
                </div>
              )
            })}
          </div>
          <ol className="mt-10 grid grid-cols-4 gap-6">
            {j.steps.map((s, i) => (
              <li key={s.title} className="journey-card text-center">
                <span className="font-display text-sm font-bold text-clay-ink" dir="ltr">0{i + 1}</span>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[16rem] text-mute">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Mobile vertical timeline */}
        <ol className="journey-mobile relative mt-14 space-y-10 lg:hidden">
          <span aria-hidden className="absolute bottom-8 start-[31px] top-8 w-0.5 bg-line" />
          <span aria-hidden className="v-progress absolute bottom-8 start-[31px] top-8 w-0.5 origin-top bg-pine" />
          {j.steps.map((s, i) => {
            const Icon = icons[i]
            return (
              <li key={s.title} className="relative flex gap-5">
                <span className="journey-node relative z-10 grid size-16 shrink-0 place-items-center rounded-full border-2 border-line bg-paper text-pine">
                  <Icon className="size-6" aria-hidden />
                </span>
                <div className="journey-card pt-2">
                  <span className="font-display text-sm font-bold text-clay-ink" dir="ltr">0{i + 1}</span>
                  <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-mute">{s.desc}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
