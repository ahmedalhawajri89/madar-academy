import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Clock, MapPin, Signal, Star } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared, type CategoryId } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { Flip, gsap, prefersReducedMotion } from '../../lib/gsap'
import { useTravel } from '../../hooks/useTravel'
import { Button } from '../ui/Button'
import { categoryIcon } from '../ui/Icons'
import { SectionHeading } from '../ui/SectionHeading'

type Filter = 'all' | CategoryId

/** Generated cover art: category color + orbit arcs + icon. No external images needed. */
function Cover({ cat, seed }: { cat: CategoryId; seed: number }) {
  const Icon = categoryIcon[cat]
  const color = shared.categoryColor[cat]
  const light = cat === 'marketing'
  const cx = 60 + ((seed * 47) % 240)
  return (
    <div data-mask className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem]" style={{ backgroundColor: color }}>
      <div data-mask-inner className="absolute inset-0">
      <svg aria-hidden viewBox="0 0 400 250" className={`absolute inset-0 size-full transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:rotate-3 ${light ? 'text-ink/15' : 'text-paper/15'}`}>
        <circle cx={cx} cy="250" r="90" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx={cx} cy="250" r="150" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
        <circle cx={cx} cy="250" r="210" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx={cx + 150} cy="250" r="7" fill="#CDEF6A" />
        <circle cx={cx - 64} cy="186" r="5" fill={light ? '#0E211C' : '#F4EFE4'} />
      </svg>
      </div>
      <span className={`absolute start-5 top-5 grid size-14 place-items-center rounded-2xl backdrop-blur-md ${light ? 'bg-ink/10 text-ink' : 'bg-paper/15 text-paper'}`}>
        <Icon className="size-6" aria-hidden />
      </span>
    </div>
  )
}

export function Courses() {
  const { t, lang } = useLang()
  const c = t.courses
  const travel = useTravel()
  const ref = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLUListElement>(null)
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  useSectionMotion(ref)

  const visible = shared.courses.filter((x) => filter === 'all' || x.cat === filter)
  const price = { format: (n: number) => (lang === 'ar' ? `${n}$` : `$${n}`) }

  const choose = (f: Filter) => {
    if (f === filter) return
    if (gridRef.current && !prefersReducedMotion()) {
      flipState.current = Flip.getState(gridRef.current.querySelectorAll('.course-card'))
    }
    setFilter(f)
  }

  // Animate the layout change between filters (cards glide to new slots, leavers shrink out)
  useLayoutEffect(() => {
    const state = flipState.current
    if (!state) return
    flipState.current = null
    Flip.from(state, {
      duration: 0.7,
      ease: 'power3.inOut',
      stagger: 0.03,
      absolute: true,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.6, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.9, duration: 0.35 }),
    })
  }, [filter])

  return (
    <section id="courses" ref={ref} className="bg-ivory py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
        </div>

        <div data-reveal className="no-scrollbar -mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div role="group" aria-label={c.eyebrow} className="flex w-max gap-2 rounded-full bg-paper p-1.5 ring-1 ring-line">
            {c.filters.map((f) => {
              const active = f.id === filter
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => choose(f.id as Filter)}
                  className={`h-11 rounded-full px-5 text-sm font-semibold transition-colors duration-300 ${active ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'}`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">{c.showing(visible.length)}</p>

        <ul ref={gridRef} className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shared.courses.map((course, i) => {
            const shown = filter === 'all' || course.cat === filter
            return (
              <li key={course.id} data-flip-id={course.id} className={`course-card ${shown ? '' : 'hidden'}`}>
                <article data-cursor={t.cursor.view} className="group flex h-full flex-col rounded-[var(--radius-card)] bg-paper p-3 ring-1 ring-line transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-24px_rgb(14_33_28/0.35)]">
                  <div className="relative">
                    <Cover cat={course.cat} seed={i} />
                    <span className="absolute end-4 top-4 rounded-full bg-paper/95 px-3 py-1 text-xs font-semibold text-ink">{t.labels.mode[course.mode]}</span>
                  </div>
                  <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-clay-ink">{t.labels.category[course.cat]}</span>
                      <span className="inline-flex items-center gap-1 text-ink/80">
                        <Star className="size-3.5 fill-mustard text-mustard" aria-hidden />
                        {course.rating}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold leading-snug">{c.items[course.id]}</h3>
                    <ul className="mb-6 mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-mute">
                      <li className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden />{course.hours} {c.hours}</li>
                      <li className="inline-flex items-center gap-1.5"><Signal className="size-4" aria-hidden />{t.labels.level[course.level]}</li>
                      <li className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{t.labels.mode[course.mode]}</li>
                    </ul>
                    <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
                      <div>
                        <p className="text-xs text-mute">{c.from}</p>
                        <p className="font-display text-2xl font-bold">{price.format(course.price)}</p>
                        {course.seats <= 8 && <p className="mt-0.5 text-xs font-semibold text-clay-ink">{c.seatsLeft(course.seats)}</p>}
                      </div>
                      <a
                        href="#contact"
                        onClick={(e) => {
                          e.preventDefault()
                          travel('contact')
                        }}
                        aria-label={`${c.details}: ${c.items[course.id]}`}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-ink ps-4 pe-3 text-sm font-semibold text-paper transition-colors hover:bg-pine"
                      >
                        {c.details}
                        <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>

        <div data-reveal className="mt-12 flex justify-center">
          <Button href="#contact" variant="ghost">{c.viewAll}</Button>
        </div>
      </div>
    </section>
  )
}
