import { useId, useRef, useState } from 'react'
import { MessageCircle, Plus } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { Button } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'

export function FAQ() {
  const { t } = useLang()
  const f = t.faq
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(0)
  const uid = useId()
  useSectionMotion(ref)

  return (
    <section id="faq" ref={ref} className="bg-paper py-24 md:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow={f.eyebrow} title={f.title} />
          <div data-reveal className="mt-10 rounded-[var(--radius-card)] bg-ivory p-6 ring-1 ring-line md:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#25D366] text-white">
              <MessageCircle className="size-6" aria-hidden />
            </span>
            <h3 className="mt-5 text-xl font-bold">{f.helpTitle}</h3>
            <p className="mt-2 text-mute">{f.helpDesc}</p>
            <div className="mt-6">
              <Button href={shared.whatsapp} external variant="dark">{f.helpCta}</Button>
            </div>
          </div>
        </div>

        <ul data-reveal-group className="divide-y divide-line border-y border-line">
          {f.items.map((item, i) => {
            const isOpen = open === i
            const btn = `${uid}-q${i}`
            const panel = `${uid}-a${i}`
            return (
              <li key={item.q}>
                <h3>
                  <button
                    id={btn}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-start font-display text-lg font-semibold md:text-xl"
                  >
                    <span className="transition-colors group-hover:text-pine">{item.q}</span>
                    <span
                      aria-hidden
                      className={`grid size-11 shrink-0 place-items-center rounded-full transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)] ${
                        isOpen ? 'rotate-45 bg-lime text-ink' : 'bg-ivory text-ink ring-1 ring-line group-hover:bg-sand'
                      }`}
                    >
                      <Plus className="size-5" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="max-w-2xl pb-7 pe-14 text-mute">{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
