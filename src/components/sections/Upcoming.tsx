import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { Button } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'

/** Demo cohorts are scheduled relative to today so the countdown is always in the future. */
function cohortDate(offsetDays: number) {
  const d = new Date()
  d.setHours(18, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, target.getTime() - now)
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1000) % 60,
  }
}

export function Upcoming() {
  const { t, lang } = useLang()
  const u = t.upcoming
  const ref = useRef<HTMLElement>(null)
  useSectionMotion(ref)
  const dates = useMemo(() => shared.upcoming.map((c) => cohortDate(c.offsetDays)), [])
  const left = useCountdown(dates[0])
  const locale = lang === 'ar' ? 'ar-u-nu-latn' : 'en'
  const dayFmt = new Intl.DateTimeFormat(locale, { day: 'numeric' })
  const monthFmt = new Intl.DateTimeFormat(locale, { month: 'short' })
  const fullFmt = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from('.seat-bar', { scaleX: 0, duration: 1.4, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.cohort-list', start: 'top 80%', once: true } })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section id="cohorts" ref={ref} className="bg-paper py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={u.eyebrow} title={u.title} sub={u.sub} />

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.9fr_2fr]">
          {/* Countdown */}
          <div data-reveal className="relative overflow-hidden rounded-[var(--radius-card)] bg-clay p-7 text-paper md:p-8">
            <svg aria-hidden viewBox="0 0 200 200" className="absolute -bottom-16 -end-16 size-64 text-paper/15">
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeDasharray="3 6" />
            </svg>
            <p className="relative font-medium text-paper/85">{u.countdown}</p>
            <div className="relative mt-5 grid grid-cols-4 gap-2" aria-hidden dir="ltr">
              {(['d', 'h', 'm', 's'] as const).map((k) => (
                <div key={k} className="rounded-2xl bg-ink/20 px-1 py-3 text-center">
                  <p className="font-display text-3xl font-bold tabular-nums md:text-4xl">{String(left[k]).padStart(2, '0')}</p>
                  <p className="mt-1 text-xs text-paper/80" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{u.units[k]}</p>
                </div>
              ))}
            </div>
            <p className="relative mt-6 font-display text-lg font-semibold">{t.courses.items[shared.upcoming[0].course]}</p>
            <p className="relative text-sm text-paper/80">
              {u.startsOn} {fullFmt.format(dates[0])}
            </p>
            <div className="relative mt-7">
              <Button href="#contact" variant="paper">{u.book}</Button>
            </div>
          </div>

          {/* Cohort list */}
          <ul className="cohort-list flex flex-col gap-3" data-reveal-group>
            {shared.upcoming.map((c, i) => (
              <li key={c.course} className="flex flex-col gap-5 rounded-3xl bg-ivory p-4 ring-1 ring-line transition-colors hover:bg-sand/60 sm:flex-row sm:items-center md:p-5">
                <div className="flex items-center gap-4 sm:contents">
                  <time dateTime={dates[i].toISOString()} className="grid size-16 shrink-0 place-content-center rounded-2xl bg-ink text-center text-paper">
                    <span className="font-display text-2xl font-bold leading-none">{dayFmt.format(dates[i])}</span>
                    <span className="mt-1 text-xs text-lime">{monthFmt.format(dates[i])}</span>
                  </time>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold leading-snug">{t.courses.items[c.course]}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mute">
                      <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden />{u.schedule[i]}</span>
                      <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-semibold text-ink ring-1 ring-line">{t.labels.mode[c.mode]}</span>
                    </p>
                  </div>
                </div>
                <div className="sm:w-44">
                  <p className={`text-xs font-semibold ${c.seats <= 6 ? 'text-clay-ink' : 'text-mute'}`}>{u.seats(c.seats, c.total)}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line" role="presentation">
                    <div className={`seat-bar h-full rounded-full ltr:origin-left rtl:origin-right ${c.seats <= 6 ? 'bg-clay' : 'bg-pine'}`} style={{ width: `${((c.total - c.seats) / c.total) * 100}%` }} />
                  </div>
                </div>
                <Button href="#contact" variant="dark" className="sm:shrink-0">{u.book}</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
