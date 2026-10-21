import { useRef, type PointerEvent, type ReactNode } from 'react'
import { Armchair, Award, BadgeCheck, BriefcaseBusiness, FolderKanban, MonitorPlay, Users } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { Photo } from '../ui/Icons'
import { SectionHeading } from '../ui/SectionHeading'

function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div
      onPointerMove={onMove}
      className={`bento spotlight group overflow-hidden rounded-[var(--radius-card)] p-6 transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 md:p-8 ${className}`}
    >
      {children}
    </div>
  )
}

function IconBadge({ children, tone = 'ink' }: { children: ReactNode; tone?: 'ink' | 'lime' | 'paper' }) {
  const tones = { ink: 'bg-ink text-lime', lime: 'bg-lime text-ink', paper: 'bg-paper text-ink' }
  return <span className={`grid size-12 place-items-center rounded-2xl ${tones[tone]}`}>{children}</span>
}

export function WhyUs() {
  const { t, sign } = useLang()
  const w = t.why
  const ref = useRef<HTMLElement>(null)
  useSectionMotion(ref)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.bento', {
          y: 60,
          autoAlpha: 0,
          scale: 0.96,
          duration: 1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.bento-grid', start: 'top 80%', once: true },
        })
        // On-campus / online toggle: indicator slides back and forth
        gsap.to('.mode-knob', { xPercent: 100 * sign, duration: 0.6, ease: 'power3.inOut', repeat: -1, yoyo: true, repeatDelay: 1.6 })
        // Portfolio tiles fan out on hover-in
        gsap.from('.tile', {
          y: 30,
          rotate: (i) => (i - 1) * 6,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '.tiles', start: 'top 85%', once: true },
        })
        // Career bar fills to 78%
        gsap.from('.career-bar', { scaleX: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: '.career-bar', start: 'top 90%', once: true } })
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [sign] },
  )

  return (
    <section id="why" ref={ref} className="bg-ivory py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={w.eyebrow} title={w.title} sub={w.sub} />

        <div className="bento-grid mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(230px,auto)]">
          {/* 1 — Trainers (big) */}
          <Card className="relative flex flex-col justify-between bg-pine text-paper md:col-span-2 lg:row-span-2">
            <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -bottom-24 -end-24 size-[380px] text-lime/20 transition-transform duration-[1.5s] ease-[var(--ease-out-expo)] group-hover:rotate-45">
              <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" />
              <circle cx="200" cy="200" r="130" fill="none" stroke="currentColor" strokeDasharray="4 8" />
              <circle cx="200" cy="200" r="70" fill="none" stroke="currentColor" />
              <circle cx="390" cy="200" r="8" fill="#CDEF6A" />
              <circle cx="200" cy="70" r="6" fill="#DD5F37" />
            </svg>
            <div>
              <IconBadge tone="lime"><Users className="size-5" aria-hidden /></IconBadge>
              <h3 className="mt-6 text-2xl font-bold md:text-3xl">{w.trainers.title}</h3>
              <p className="mt-3 max-w-md text-paper/75">{w.trainers.desc}</p>
            </div>
            <div className="relative mt-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-display text-6xl font-extrabold text-lime md:text-7xl" dir="ltr">{w.trainers.stat}</p>
                <p className="mt-1 text-paper/70">{w.trainers.statLabel}</p>
              </div>
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {shared.trainers.map((src) => (
                  <Photo key={src} src={src} alt="" width={56} height={56} className="size-14 rounded-full object-cover ring-4 ring-pine" />
                ))}
              </div>
            </div>
          </Card>

          {/* 2 — Projects */}
          <Card className="flex flex-col gap-6 bg-paper ring-1 ring-line sm:flex-row sm:items-center md:col-span-2 lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
            <div className="flex-1">
              <IconBadge><FolderKanban className="size-5" aria-hidden /></IconBadge>
              <h3 className="mt-5 text-xl font-bold md:text-2xl">{w.projects.title}</h3>
              <p className="mt-2 text-mute">{w.projects.desc}</p>
            </div>
            <div className="tiles relative flex h-36 flex-1 items-center justify-center" aria-hidden>
              {w.projects.tiles.map((label, i) => (
                <div
                  key={label}
                  className={`tile absolute w-36 rounded-2xl p-3 shadow-lg ring-1 ring-ink/5 transition-transform duration-500 ${
                    ['bg-sand -translate-x-16 -rotate-6 group-hover:-translate-x-20', 'z-10 bg-lime group-hover:-translate-y-2', 'bg-clay text-paper translate-x-16 rotate-6 group-hover:translate-x-20'][i]
                  }`}
                >
                  <div className="h-14 rounded-lg bg-ink/10" />
                  <p className="mt-2 truncate font-display text-xs font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* 3 — Certificates */}
          <Card className="bg-paper ring-1 ring-line">
            <IconBadge><Award className="size-5" aria-hidden /></IconBadge>
            <h3 className="mt-5 text-xl font-bold">{w.cert.title}</h3>
            <p className="mt-2 text-mute">{w.cert.desc}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold text-pine" dir="ltr">
              <BadgeCheck className="size-3.5" aria-hidden /> ID: MDR-2026-04817
            </p>
          </Card>

          {/* 4 — Flexible mode */}
          <Card className="bg-paper ring-1 ring-line">
            <IconBadge><MonitorPlay className="size-5" aria-hidden /></IconBadge>
            <h3 className="mt-5 text-xl font-bold">{w.flex.title}</h3>
            <p className="mt-2 text-mute">{w.flex.desc}</p>
            <div aria-hidden className="relative mt-5 grid grid-cols-2 rounded-full bg-ivory p-1 text-center text-sm font-semibold ring-1 ring-line">
              <span className="mode-knob absolute inset-y-1 start-1 w-[calc(50%-0.25rem)] rounded-full bg-ink" />
              <span className="relative z-10 py-1.5 text-paper mix-blend-difference">{w.flex.a}</span>
              <span className="relative z-10 py-1.5 text-paper mix-blend-difference">{w.flex.b}</span>
            </div>
          </Card>

          {/* 5 — Career */}
          <Card className="bg-lime lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-sm">
                <IconBadge><BriefcaseBusiness className="size-5" aria-hidden /></IconBadge>
                <h3 className="mt-5 text-xl font-bold md:text-2xl">{w.career.title}</h3>
                <p className="mt-2 text-ink/75">{w.career.desc}</p>
              </div>
              <p className="font-display text-6xl font-extrabold" dir="ltr">{w.career.stat}</p>
            </div>
            <div className="mt-6">
              <div className="h-2.5 overflow-hidden rounded-full bg-ink/10">
                <div className="career-bar h-full w-[78%] rounded-full bg-ink ltr:origin-left rtl:origin-right" />
              </div>
              <p className="mt-2 text-sm font-medium text-ink/70">{w.career.statLabel}</p>
            </div>
          </Card>

          {/* 6 — Space */}
          <Card className="relative bg-ink text-paper lg:col-span-2">
            <div aria-hidden className="grid-lines absolute inset-0 opacity-60" />
            <div className="relative flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-sm">
                <IconBadge tone="paper"><Armchair className="size-5" aria-hidden /></IconBadge>
                <h3 className="mt-5 text-xl font-bold md:text-2xl">{w.space.title}</h3>
                <p className="mt-2 text-paper/70">{w.space.desc}</p>
              </div>
              <div aria-hidden className="grid shrink-0 grid-cols-4 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => (
                  <span key={i} className={`size-5 rounded-md ${[2, 5, 11].includes(i) ? 'bg-lime' : i === 8 ? 'bg-clay' : 'bg-paper/15'}`} />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
