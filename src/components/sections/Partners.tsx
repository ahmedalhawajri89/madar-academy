import { useRef } from 'react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { gsap, MQ, useGSAP } from '../../lib/gsap'

const marks = ['circle', 'square', 'diamond', 'ring', 'half'] as const

function Mark({ i }: { i: number }) {
  const kind = marks[i % marks.length]
  const cls = 'size-5 shrink-0 text-pine'
  switch (kind) {
    case 'circle':
      return <svg viewBox="0 0 20 20" className={cls}><circle cx="10" cy="10" r="8" fill="currentColor" /></svg>
    case 'square':
      return <svg viewBox="0 0 20 20" className={cls}><rect x="3" y="3" width="14" height="14" rx="3" fill="currentColor" /></svg>
    case 'diamond':
      return <svg viewBox="0 0 20 20" className={cls}><path d="M10 1l9 9-9 9-9-9z" fill="currentColor" /></svg>
    case 'ring':
      return <svg viewBox="0 0 20 20" className={cls}><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="3" /></svg>
    default:
      return <svg viewBox="0 0 20 20" className={cls}><path d="M2 10a8 8 0 0 1 16 0z" fill="currentColor" /></svg>
  }
}

export function Partners() {
  const { t, sign } = useLang()
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        const track = ref.current!.querySelector<HTMLElement>('.marquee-track')!
        // Two identical copies: moving by half the track loops seamlessly in either direction.
        const tween = gsap.to(track, { xPercent: -50 * sign, duration: 38, ease: 'none', repeat: -1 })
        const pause = () => gsap.to(tween, { timeScale: 0, duration: 0.6 })
        const play = () => gsap.to(tween, { timeScale: 1, duration: 0.6 })
        const box = ref.current!.querySelector<HTMLElement>('.marquee')!
        box.addEventListener('pointerenter', pause)
        box.addEventListener('pointerleave', play)
        box.addEventListener('focusin', pause)
        box.addEventListener('focusout', play)
        return () => {
          box.removeEventListener('pointerenter', pause)
          box.removeEventListener('pointerleave', play)
          box.removeEventListener('focusin', pause)
          box.removeEventListener('focusout', play)
        }
      })
      return () => mm.revert()
    },
    { scope: ref, dependencies: [sign] },
  )

  const list = (copy: number) => (
    <ul aria-hidden={copy > 0 || undefined} className={`flex shrink-0 items-center gap-12 pe-12 md:gap-16 md:pe-16 ${copy > 0 ? 'motion-reduce:hidden' : ''}`}>
      {shared.partners.map((p, i) => (
        <li key={p} dir="ltr" className="flex items-center gap-2.5 whitespace-nowrap font-display text-xl font-bold tracking-tight text-ink/55 transition-colors hover:text-ink md:text-2xl">
          <Mark i={i} />
          {p}
        </li>
      ))}
    </ul>
  )

  return (
    <section ref={ref} aria-label={t.partners.title} className="border-b border-line bg-ivory py-12 md:py-14">
      <p className="container-x text-center text-sm font-medium text-mute">{t.partners.title}</p>
      <div className="marquee mask-fade-x mt-7 overflow-hidden">
        <div className="marquee-track flex w-max motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center">
          {list(0)}
          {list(1)}
        </div>
      </div>
    </section>
  )
}
