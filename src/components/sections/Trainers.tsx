import { useRef } from 'react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { Photo, Social } from '../ui/Icons'
import { SectionHeading } from '../ui/SectionHeading'

const tints = ['bg-lime', 'bg-clay', 'bg-sage', 'bg-mustard']

export function Trainers() {
  const { t } = useLang()
  const tr = t.trainers
  const ref = useRef<HTMLElement>(null)
  useSectionMotion(ref)

  return (
    <section id="trainers" ref={ref} className="bg-ivory py-24 md:py-32">
      <div className="container-x">
        <SectionHeading eyebrow={tr.eyebrow} title={tr.title} sub={tr.sub} />
        <ul data-reveal-group className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tr.items.map((p, i) => (
            <li key={p.name} className="group">
              <article className="h-full rounded-[var(--radius-card)] bg-paper p-3 ring-1 ring-line transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5">
                <div className={`relative aspect-[4/4.4] overflow-hidden rounded-[1.25rem] ${tints[i]}`}>
                  <Photo
                    src={shared.trainerPhotos[i]}
                    alt={p.name}
                    width={400}
                    height={440}
                    className="size-full object-cover grayscale-[35%] transition-[transform,filter] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <span className="absolute start-3 top-3 rounded-full bg-paper/95 px-3 py-1 text-xs font-semibold">{p.exp}</span>
                  <a
                    href="#"
                    aria-label={`${tr.profile}: ${p.name}`}
                    className="absolute bottom-3 end-3 grid size-11 place-items-center rounded-full bg-ink text-paper transition-[transform,opacity] duration-500 hover:bg-pine focus-visible:translate-y-0 focus-visible:opacity-100 [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <Social.linkedin className="size-5" />
                  </a>
                </div>
                <div className="px-2 pb-3 pt-4">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="text-sm font-semibold text-clay-ink">{p.role}</p>
                  <p className="mt-2 text-sm text-mute">{p.bio}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
