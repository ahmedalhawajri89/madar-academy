import { useRef } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { Button } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'

export function Pricing() {
  const { t } = useLang()
  const p = t.pricing
  const ref = useRef<HTMLElement>(null)
  useSectionMotion(ref)

  return (
    <section id="pricing" ref={ref} className="bg-ivory py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={p.eyebrow} title={p.title} sub={p.sub} align="center" />

        <ul data-reveal-group className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {p.plans.map((plan, i) => {
            const featured = i === 1
            return (
              <li
                key={plan.name}
                className={`relative flex flex-col rounded-[var(--radius-card)] p-7 transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 md:p-8 ${
                  featured ? 'bg-pine text-paper shadow-[0_30px_80px_-30px_rgb(22_70_58/0.7)] lg:-my-4 lg:py-12' : 'bg-paper ring-1 ring-line'
                }`}
              >
                {featured && (
                  <span className="absolute -top-3.5 start-7 inline-flex items-center gap-1.5 rounded-full bg-lime px-3.5 py-1 text-xs font-bold text-ink">
                    <Sparkles className="size-3.5" aria-hidden />
                    {p.popular}
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className={`mt-2 text-sm ${featured ? 'text-paper/70' : 'text-mute'}`}>{plan.desc}</p>
                <p className="mt-7 flex flex-wrap items-baseline gap-x-2">
                  {plan.prefix && <span className={`text-sm ${featured ? 'text-paper/70' : 'text-mute'}`}>{plan.prefix}</span>}
                  <span className={`font-display text-5xl font-extrabold ${featured ? 'text-lime' : ''}`}>{plan.price}</span>
                </p>
                <p className={`mt-1 text-sm ${featured ? 'text-paper/70' : 'text-mute'}`}>{plan.period}</p>
                <ul className={`mt-7 space-y-3 border-t pt-7 ${featured ? 'border-paper/15' : 'border-line'}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full ${featured ? 'bg-lime text-ink' : 'bg-ink text-lime'}`}>
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                      <span className={featured ? 'text-paper/90' : ''}>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-9">
                  <Button href="#contact" variant={featured ? 'lime' : 'dark'} className="w-full" magnetic={featured}>
                    {plan.cta}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>

        <div data-reveal className="mt-10 flex flex-col items-start justify-between gap-6 rounded-[var(--radius-card)] bg-ink p-7 text-paper md:flex-row md:items-center md:p-9">
          <div>
            <h3 className="text-2xl font-bold">{p.consultTitle}</h3>
            <p className="mt-2 max-w-xl text-paper/70">{p.consultDesc}</p>
          </div>
          <Button href="#contact" variant="lime" size="lg" magnetic className="shrink-0">
            {p.consultCta}
          </Button>
        </div>
      </div>
    </section>
  )
}
