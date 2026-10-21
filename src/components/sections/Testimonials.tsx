import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/gsap'
import { Photo, Stars } from '../ui/Icons'
import { SectionHeading } from '../ui/SectionHeading'

const SLIDE_SECONDS = 7

export function Testimonials() {
  const { t, sign } = useLang()
  const tm = t.testimonials
  const n = tm.items.length
  const ref = useRef<HTMLElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(() => prefersReducedMotion())
  const [hold, setHold] = useState(false) // hover / focus inside
  const progress = useRef<gsap.core.Tween | null>(null)
  const first = useRef(true)
  useSectionMotion(ref)

  const go = (d: number) => setIndex((i) => (i + d + n) % n)

  // Slide transition
  useGSAP(
    () => {
      if (first.current) {
        first.current = false
        return
      }
      if (prefersReducedMotion()) return
      const slide = ref.current!.querySelector(`[data-slide="${index}"]`)
      if (!slide) return
      gsap.fromTo(slide.querySelectorAll('.anim'), { x: 40 * sign, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07, ease: 'expo.out' })
    },
    { scope: ref, dependencies: [index] },
  )

  // Autoplay: the progress bar tween *is* the timer
  useGSAP(
    () => {
      progress.current?.kill()
      const bar = ref.current!.querySelector(`[data-bar="${index}"]`)
      gsap.set(ref.current!.querySelectorAll('[data-bar]'), { scaleX: (i: number) => (i < index ? 1 : 0) })
      progress.current = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: SLIDE_SECONDS, ease: 'none', onComplete: () => go(1), paused: true })
    },
    { scope: ref, dependencies: [index] },
  )

  useEffect(() => {
    const tw = progress.current
    if (!tw) return
    if (paused || hold) tw.pause()
    else tw.resume()
  }, [paused, hold, index])

  return (
    <section id="testimonials" ref={ref} className="bg-ivory py-24 md:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.6fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={tm.eyebrow} title={tm.title} />
          <div data-reveal className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-paper p-5 ring-1 ring-line">
              <p className="font-display text-5xl font-extrabold" dir="ltr">{tm.score}</p>
              <Stars className="mt-2 size-4 text-ink" />
              <p className="mt-2 text-sm text-mute">{tm.scoreLabel}</p>
            </div>
            <div className="rounded-3xl bg-lime p-5">
              <p className="font-display text-5xl font-extrabold" dir="ltr">{tm.recommend}</p>
              <p className="mt-4 text-sm text-ink/75">{tm.recommendLabel}</p>
            </div>
          </div>
        </div>

        <div
          data-reveal
          role="region"
          aria-roledescription="carousel"
          aria-label={tm.eyebrow}
          onPointerEnter={() => setHold(true)}
          onPointerLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHold(false)}
          className="relative flex flex-col rounded-[2rem] bg-ink p-6 text-paper md:p-10 lg:p-12"
        >
          <Quote aria-hidden className="absolute end-8 top-8 size-20 text-lime/15 md:size-28 rtl:-scale-x-100" />

          <div className="grid" aria-live={paused ? 'polite' : 'off'}>
            {tm.items.map((item, i) => {
              const active = i === index
              return (
                <figure
                  key={item.name}
                  data-slide={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={tm.slideOf(i + 1, n)}
                  aria-hidden={!active}
                  inert={!active}
                  className={`col-start-1 row-start-1 transition-opacity duration-300 ${active ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                >
                  <p className="anim text-sm font-semibold text-lime">{item.course}</p>
                  <blockquote className="anim mt-5 font-display text-[clamp(1.25rem,2.4vw,1.9rem)] font-medium leading-[1.6] ltr:leading-snug">
                    “{item.quote}”
                  </blockquote>
                  <figcaption className="anim mt-8 flex items-center gap-4">
                    <Photo src={shared.testimonials[i]} alt="" width={56} height={56} className="size-14 rounded-full object-cover ring-2 ring-lime" />
                    <span>
                      <span className="block font-display font-semibold">{item.name}</span>
                      <span className="block text-sm text-paper/65">{item.role}</span>
                    </span>
                  </figcaption>
                </figure>
              )
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-paper/10 pt-6">
            <div className="flex flex-1 gap-2" aria-hidden>
              {tm.items.map((_, i) => (
                <button key={i} type="button" tabIndex={-1} onClick={() => setIndex(i)} className="h-6 flex-1 py-2.5">
                  <span className="block h-1 overflow-hidden rounded-full bg-paper/15">
                    <span data-bar={i} className="block h-full rounded-full bg-lime ltr:origin-left rtl:origin-right" style={{ transform: 'scaleX(0)' }} />
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="me-2 font-display text-sm tabular-nums text-paper/60" dir="ltr">
                {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
              <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? tm.play : tm.pause} className="grid size-11 place-items-center rounded-full bg-paper/10 hover:bg-paper/20">
                {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
              </button>
              <button type="button" onClick={() => go(-1)} aria-label={tm.prev} className="grid size-11 place-items-center rounded-full bg-paper/10 hover:bg-paper/20">
                <ChevronRight className="size-5 ltr:rotate-180" aria-hidden />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={tm.next} className="grid size-11 place-items-center rounded-full bg-lime text-ink hover:bg-lime-2">
                <ChevronLeft className="size-5 ltr:rotate-180" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
