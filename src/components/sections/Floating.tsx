import { useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { Button } from '../ui/Button'

/** WhatsApp bubble + mobile sticky enrollment bar (shown after the hero, hidden near the form). */
export function Floating() {
  const { t } = useLang()
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const bar = ref.current!.querySelector('.sticky-bar')
      const wa = ref.current!.querySelector('.wa-btn')
      let pastHero = false
      let nearForm = false
      const d = prefersReducedMotion() ? 0 : 0.5
      const update = () => {
        const show = pastHero && !nearForm
        gsap.to(bar, { yPercent: show ? 0 : 120, duration: d, ease: 'power3.out', overwrite: true })
        gsap.to(wa, { scale: pastHero ? 1 : 0, autoAlpha: pastHero ? 1 : 0, duration: d, ease: 'back.out(1.8)', overwrite: true })
      }
      gsap.set(bar, { yPercent: 120 })
      gsap.set(wa, { scale: 0, autoAlpha: 0 })
      ScrollTrigger.create({ trigger: '#top', start: 'bottom 70%', end: 'max', onToggle: (s) => ((pastHero = s.isActive), update()) })
      ScrollTrigger.create({ trigger: '#contact', start: 'top bottom', end: 'max', onToggle: (s) => ((nearForm = s.isActive), update()) })
    },
    { scope: ref },
  )

  return (
    <div ref={ref}>
      <a
        href={shared.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.floating.whatsapp}
        className="wa-btn group fixed bottom-24 end-4 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.6)] lg:bottom-6 lg:end-6"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 motion-reduce:hidden" />
        <MessageCircle className="relative size-6" aria-hidden />
        <span className="pointer-events-none absolute end-full me-3 hidden whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100 lg:block">
          {t.floating.whatsapp}
        </span>
      </a>

      <div className="sticky-bar fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/90 p-3 backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="flex gap-2">
          <Button href="#contact" variant="dark" className="flex-1">{t.floating.register}</Button>
          <Button href="#contact" variant="ghost" arrow={false} className="flex-1">{t.floating.consult}</Button>
        </div>
      </div>
    </div>
  )
}
