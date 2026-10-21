import { useRef, useState } from 'react'
import { useLang } from '../../i18n/LangContext'
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/gsap'
import { finishIntro, isIntroDone } from '../../lib/intro'
import { lockScroll } from '../../lib/scroll'

const SEEN_KEY = 'madar-intro-seen'

function shouldPlay() {
  if (isIntroDone() || prefersReducedMotion()) return false
  try {
    return !sessionStorage.getItem(SEEN_KEY)
  } catch {
    return true
  }
}

/**
 * Opening title (once per session): the Madar orbit draws itself while a
 * satellite travels its path and a counter runs to 100. The black frame then
 * closes into letterbox bars and slides away — the film starts.
 */
export function Preloader() {
  const { t } = useLang()
  const [play] = useState(shouldPlay)
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!play) {
        finishIntro()
        return
      }
      try {
        sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* storage unavailable */
      }
      lockScroll(true)
      const num = ref.current!.querySelector('.pl-num')!
      const counter = { v: 0 }

      gsap
        .timeline({ defaults: { ease: 'madar.inOut' } })
        .from('.pl-orbit', { drawSVG: '0%', duration: 1.3 }, 0)
        .from('.pl-planet', { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2)' }, 0.45)
        .to('.pl-sat', { motionPath: { path: '.pl-orbit', align: '.pl-orbit', alignOrigin: [0.5, 0.5] }, duration: 1.7 }, 0.1)
        .from('.pl-name', { yPercent: 110, duration: 0.9, ease: 'madar.out' }, 0.55)
        .from('.pl-tag', { autoAlpha: 0, y: 8, duration: 0.6 }, 0.9)
        .to(
          counter,
          {
            v: 100,
            duration: 1.9,
            ease: 'power2.inOut',
            onUpdate: () => {
              num.textContent = String(Math.round(counter.v)).padStart(3, '0')
            },
          },
          0,
        )
        .addLabel('exit', '+=0.2')
        .to('.pl-content', { autoAlpha: 0, y: -24, duration: 0.45, ease: 'power2.in' }, 'exit')
        // Frame closes into cinematic letterbox bars…
        .to('.pl-bar', { scaleY: 0.11, duration: 0.9 }, 'exit+=0.1')
        .call(
          () => {
            lockScroll(false)
            finishIntro()
          },
          [],
          'exit+=0.55',
        )
        // …which hold a beat while the hero plays, then leave the frame
        .to('.pl-bar', { scaleY: 0, duration: 1, delay: 0.9 }, 'exit+=1')
        .set(ref.current, { display: 'none' })

      return () => lockScroll(false)
    },
    { scope: ref },
  )

  if (!play) return null

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <div className="pl-bar absolute inset-x-0 top-0 h-1/2 origin-top bg-ink" />
      <div className="pl-bar absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-ink" />
      <div className="pl-content absolute inset-0 grid place-items-center text-paper">
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 100 100" className="size-36 overflow-visible md:size-44">
            <g transform="rotate(-28 50 50)">
              <path className="pl-orbit" d="M6,50 a44,18 0 1,0 88,0 a44,18 0 1,0 -88,0" fill="none" stroke="#CDEF6A" strokeWidth="2.2" />
            </g>
            <circle className="pl-planet" cx="50" cy="50" r="13" fill="#F4EFE4" />
            <circle className="pl-sat" cx="0" cy="0" r="4.5" fill="#DD5F37" />
          </svg>
          <span className="mt-6 block overflow-hidden py-1">
            <span className="pl-name block font-display text-2xl font-bold md:text-3xl">{t.brand.short}</span>
          </span>
          <span className="pl-tag mt-1 text-sm text-paper/60">{t.intro}</span>
        </div>
        <span className="pl-num absolute bottom-8 end-8 font-mono text-sm tracking-[0.3em] text-lime" dir="ltr">
          000
        </span>
      </div>
    </div>
  )
}
