import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useTravel } from '../../hooks/useTravel'
import { gsap, MQ, SplitText, useGSAP } from '../../lib/gsap'
import { Logo, Social } from '../ui/Icons'

export function Footer() {
  const { t, lang } = useLang()
  const f = t.footer
  const ref = useRef<HTMLElement>(null)

  // End credits: the footer rises from under the last scene, columns roll in,
  // and the oversized wordmark lifts into frame as you reach the very end.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const footer = ref.current!
        gsap.from('.credits', {
          yPercent: -22,
          ease: 'none',
          scrollTrigger: { trigger: footer, start: 'top bottom', end: 'bottom bottom', scrub: true },
        })
        gsap.from('.credits-cols > *', {
          y: 50,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 1.1,
          ease: 'madar.out',
          scrollTrigger: { trigger: footer, start: 'top 75%', once: true },
        })
        // Arabic letters must stay joined, so the Arabic wordmark moves as one word
        const split = SplitText.create('.credits-mark', { type: lang === 'ar' ? 'words' : 'chars' })
        gsap.from(lang === 'ar' ? split.words : split.chars, {
          yPercent: 70,
          scaleY: 1.4,
          autoAlpha: 0,
          stagger: 0.06,
          ease: 'none',
          transformOrigin: '50% 100%',
          scrollTrigger: { trigger: '.credits-mark', start: 'top bottom', end: 'bottom bottom', scrub: 0.8 },
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )
  const travel = useTravel()
  const [subscribed, setSubscribed] = useState(false)

  const go = (e: MouseEvent, id: string) => {
    e.preventDefault()
    travel(id)
  }
  const subscribe = (e: FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
  }

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink pb-28 pt-20 text-paper/75 lg:pb-10">
      <div className="credits container-x">
        <div className="credits-cols grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo name={t.brand.name} tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">{f.about}</p>
            <ul className="mt-6 flex gap-2" aria-label={f.socials}>
              {(Object.keys(Social) as (keyof typeof Social)[]).map((k) => {
                const G = Social[k]
                return (
                  <li key={k}>
                    <a href="#" aria-label={k} className="grid size-11 place-items-center rounded-full bg-paper/8 text-paper ring-1 ring-paper/10 transition-colors hover:bg-lime hover:text-ink">
                      <G className="size-5" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <nav aria-label={f.quick}>
            <h2 className="font-display text-base font-semibold text-paper">{f.quick}</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {t.nav.links.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="inline-block py-1.5 transition-colors hover:text-lime">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-base font-semibold text-paper">{f.coursesTitle}</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {shared.courses.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <a href="#courses" onClick={(e) => go(e, 'courses')} className="inline-block py-1.5 transition-colors hover:text-lime">{t.courses.items[c.id]}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-paper">{f.contactTitle}</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden />{f.address}</li>
              <li className="flex items-center gap-2.5"><Phone className="size-4 shrink-0 text-lime" aria-hidden /><a href={`tel:${shared.phone.replace(/\s/g, '')}`} dir="ltr" className="hover:text-lime">{shared.phone}</a></li>
              <li className="flex items-center gap-2.5"><Mail className="size-4 shrink-0 text-lime" aria-hidden /><a href={`mailto:${shared.email}`} className="hover:text-lime">{shared.email}</a></li>
            </ul>
            <h2 className="mt-8 font-display text-base font-semibold text-paper">{f.newsletter}</h2>
            <p className="mt-1 text-sm">{f.newsletterDesc}</p>
            {subscribed ? (
              <p className="mt-4 rounded-full bg-lime/15 px-4 py-3 text-sm font-semibold text-lime" role="status">{f.newsletterThanks}</p>
            ) : (
              <form onSubmit={subscribe} className="mt-4 flex gap-2 rounded-full bg-paper/8 p-1.5 ring-1 ring-paper/10 focus-within:ring-lime/60">
                <label htmlFor="nl-email" className="sr-only">{f.newsletterPh}</label>
                <input id="nl-email" type="email" required placeholder={f.newsletterPh} className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-paper placeholder:text-paper/45 focus:outline-none" />
                <button type="submit" className="h-11 shrink-0 rounded-full bg-lime px-5 text-sm font-semibold text-ink hover:bg-lime-2">{f.newsletterCta}</button>
              </form>
            )}
          </div>
        </div>

        {/* Oversized wordmark */}
        <p aria-hidden className="credits-mark pointer-events-none mt-16 select-none text-center font-display text-[clamp(5rem,22vw,18rem)] font-extrabold leading-[0.85] text-transparent [-webkit-text-stroke:1px_rgb(255_252_244/0.12)]">
          {t.brand.name}
        </p>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-5 border-t border-paper/10 pt-6 text-xs sm:flex-row sm:items-center">
          <p>{f.rights}</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-lime">{f.privacy}</a>
            <a href="#" className="hover:text-lime">{f.terms}</a>
            <a href="#top" onClick={(e) => go(e, 'top')} aria-label={f.backTop} className="grid size-11 place-items-center rounded-full bg-paper/8 text-paper ring-1 ring-paper/10 hover:bg-lime hover:text-ink">
              <ArrowUp className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
