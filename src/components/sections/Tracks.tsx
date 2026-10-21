import { useRef } from 'react'
import { ArrowRight, CalendarDays, FolderKanban, Layers, Signal } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { scrollToId } from '../../lib/scroll'
import { Button } from '../ui/Button'
import { categoryIcon } from '../ui/Icons'
import { SectionHeading } from '../ui/SectionHeading'

export function Tracks() {
  const { t, sign } = useLang()
  const tr = t.tracks
  const ref = useRef<HTMLElement>(null)
  useSectionMotion(ref)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const section = ref.current!
      const track = section.querySelector<HTMLElement>('.h-track')!

      // Desktop: pin the section and translate the track horizontally, following the reading direction.
      mm.add(MQ.desktop, () => {
        const distance = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        tl.to(track, { x: () => -distance() * sign, ease: 'none' }, 0).fromTo('.h-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)

        gsap.from('.track-card', {
          y: 80,
          autoAlpha: 0,
          stagger: 0.08,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: { trigger: section, start: 'top 70%', once: true },
        })
      })

      mm.add(MQ.mobile, () => {
        gsap.from('.track-card', {
          y: 40,
          autoAlpha: 0,
          stagger: 0.06,
          scrollTrigger: { trigger: track, start: 'top 85%', once: true },
        })
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [sign] },
  )

  return (
    <section id="tracks" ref={ref} className="relative overflow-hidden bg-paper">
      <div className="flex flex-col justify-center py-24 md:py-28 lg:min-h-screen lg:py-16">
        <div className="container-x flex flex-wrap items-end justify-between gap-8">
          <SectionHeading eyebrow={tr.eyebrow} title={tr.title} sub={tr.sub} />
          <div className="hidden w-56 lg:block" aria-hidden>
            <p className="text-sm font-medium text-mute">{tr.hint}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-progress h-full rounded-full bg-clay ltr:origin-left rtl:origin-right" />
            </div>
          </div>
        </div>

        <div className="no-scrollbar mt-12 snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:mt-14 lg:snap-none lg:overflow-visible">
          <ul className="h-track flex w-max gap-4 px-4 md:gap-5 md:px-8 xl:px-[max(2rem,calc((100vw-1280px)/2+2rem))]">
            {shared.tracks.map((track, i) => {
              const item = tr.items[track.id]
              const Icon = categoryIcon[track.icon]
              return (
                <li
                  key={track.id}
                  className="track-card group flex w-[82vw] max-w-[380px] shrink-0 snap-start flex-col rounded-[var(--radius-card)] p-6 sm:w-[360px] md:p-7 lg:w-[400px]"
                  style={{ backgroundColor: track.bg, color: track.fg }}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110" style={{ backgroundColor: track.accent, color: track.bg }}>
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="font-display text-5xl font-extrabold opacity-20 tabular-nums" dir="ltr">0{i + 1}</span>
                  </div>
                  <h3 className="mt-10 text-2xl font-bold md:text-[1.7rem]">{item.title}</h3>
                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 opacity-70" aria-hidden />
                      <dt className="sr-only">Duration</dt>
                      <dd>{item.weeks} {tr.weeks}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="size-4 opacity-70" aria-hidden />
                      <dt className="sr-only">Courses</dt>
                      <dd>{item.courses} {tr.courses}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderKanban className="size-4 opacity-70" aria-hidden />
                      <dt className="sr-only">Projects</dt>
                      <dd>{item.projects} {tr.projects}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Signal className="size-4 opacity-70" aria-hidden />
                      <dt className="sr-only">Level</dt>
                      <dd>{item.level}</dd>
                    </div>
                  </dl>
                  <ul className="mt-6 flex flex-wrap gap-2" dir="ltr" aria-label="Skills">
                    {track.skills.map((s) => (
                      <li key={s} className="rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-current/25" style={{ backgroundColor: 'rgb(255 255 255 / 0.08)' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToId('contact')
                    }}
                    className="mt-auto inline-flex items-center gap-2 pt-10 font-display font-semibold"
                  >
                    <span className="border-b border-current/40 pb-0.5 transition-colors group-hover:border-current">{tr.cta}</span>
                    <ArrowRight className="size-4 transition-transform duration-300 rtl:-scale-x-100 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden />
                  </a>
                </li>
              )
            })}
            <li className="track-card flex w-[82vw] max-w-[380px] shrink-0 snap-start flex-col justify-between rounded-[var(--radius-card)] border-2 border-dashed border-ink/20 p-6 sm:w-[360px] md:p-7 lg:w-[400px]">
              <div>
                <h3 className="text-2xl font-bold">{tr.lastTitle}</h3>
                <p className="mt-3 text-mute">{tr.lastDesc}</p>
              </div>
              <div className="mt-10">
                <Button href="#contact" variant="dark">{tr.lastCta}</Button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
