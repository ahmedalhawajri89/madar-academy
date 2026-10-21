import { useRef } from 'react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { SectionHeading } from '../ui/SectionHeading'

export function Stats() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  useSectionMotion(ref)
  const fmt = new Intl.NumberFormat('en')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        // Count up once. The real value is already in the DOM (SEO / no-JS / reduced motion).
        gsap.utils.toArray<HTMLElement>('.stat-num').forEach((el) => {
          const target = Number(el.dataset.value)
          const obj = { v: 0 }
          el.textContent = '0'
          gsap.to(obj, {
            v: target,
            duration: 2.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            onUpdate: () => {
              el.textContent = fmt.format(Math.round(obj.v))
            },
          })
        })
        // The orbit ornament turns with scroll
        gsap.to('.stats-orbit', { rotation: 120, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 } })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-pine py-24 text-paper md:py-32">
      <svg aria-hidden viewBox="0 0 600 600" className="stats-orbit absolute -end-48 -top-48 -z-10 size-[600px] text-lime/25 md:-end-24">
        <circle cx="300" cy="300" r="290" fill="none" stroke="currentColor" />
        <circle cx="300" cy="300" r="210" fill="none" stroke="currentColor" strokeDasharray="4 10" />
        <circle cx="300" cy="300" r="130" fill="none" stroke="currentColor" />
        <circle cx="590" cy="300" r="10" fill="#CDEF6A" />
        <circle cx="300" cy="90" r="7" fill="#DD5F37" />
      </svg>

      <div className="container-x">
        <SectionHeading eyebrow={t.stats.eyebrow} title={t.stats.title} tone="dark" />
        <dl className="mt-16 grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {shared.stats.map((s, i) => (
            <div key={i} data-reveal className="border-paper/15 px-2 md:px-6 [&:not(:first-child)]:lg:border-s">
              <dt className="sr-only">{t.stats.labels[i]}</dt>
              <dd>
                <p className="font-display text-[clamp(2.6rem,6vw,4.75rem)] font-extrabold leading-none text-lime" dir="ltr">
                  <span className="stat-num tabular-nums" data-value={s.value}>{fmt.format(s.value)}</span>
                  <span className="text-paper/90">{s.suffix}</span>
                </p>
                <p aria-hidden className="mt-3 text-paper/70">{t.stats.labels[i]}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
