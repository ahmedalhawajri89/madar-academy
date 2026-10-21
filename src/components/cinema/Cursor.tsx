import { useRef } from 'react'
import { gsap, MQ, useGSAP } from '../../lib/gsap'

/**
 * Cursor follower (fine pointers only; the native cursor stays).
 * Grows over interactive elements and turns into a labelled lens over
 * anything with data-cursor="…" (course cards, trainers, tracks).
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.finePointer, () => {
        const root = ref.current!
        const ring = root.querySelector<HTMLElement>('.cur-ring')!
        const label = root.querySelector<HTMLElement>('.cur-label')!
        const xTo = gsap.quickTo(root, 'x', { duration: 0.5, ease: 'power3.out' })
        const yTo = gsap.quickTo(root, 'y', { duration: 0.5, ease: 'power3.out' })
        let shown = false
        let mode = ''

        const setMode = (next: string, text = '') => {
          if (next === mode && next !== 'label') return
          mode = next
          if (next === 'label') {
            label.textContent = text
            gsap.to(ring, { scale: 2.6, backgroundColor: 'rgba(221,95,55,0.95)', borderColor: 'rgba(221,95,55,0)', duration: 0.45, ease: 'madar.out', overwrite: true })
            gsap.to(label, { autoAlpha: 1, scale: 1, duration: 0.35, delay: 0.05, overwrite: true })
          } else {
            gsap.to(ring, {
              scale: next === 'hover' ? 1.7 : next === 'hide' ? 0 : 1,
              backgroundColor: next === 'hover' ? 'rgba(221,95,55,0.12)' : 'rgba(221,95,55,0)',
              borderColor: 'rgba(221,95,55,0.9)',
              duration: 0.4,
              ease: 'madar.out',
              overwrite: true,
            })
            gsap.to(label, { autoAlpha: 0, scale: 0.6, duration: 0.2, overwrite: true })
          }
        }

        const move = (e: PointerEvent) => {
          if (!shown) {
            shown = true
            gsap.set(root, { x: e.clientX, y: e.clientY })
            gsap.to(root, { autoAlpha: 1, duration: 0.3 })
          }
          xTo(e.clientX)
          yTo(e.clientY)
        }
        const over = (e: PointerEvent) => {
          const el = (e.target as Element | null)?.closest?.('[data-cursor], a, button, label, input, textarea, select, [role="button"]')
          if (!el) return setMode('idle')
          if (el.matches('input, textarea, select')) return setMode('hide')
          const text = el.getAttribute('data-cursor')
          if (text) return setMode('label', text)
          setMode('hover')
        }
        const leave = () => {
          shown = false
          gsap.to(root, { autoAlpha: 0, duration: 0.3 })
        }

        window.addEventListener('pointermove', move)
        document.addEventListener('pointerover', over)
        document.documentElement.addEventListener('pointerleave', leave)
        return () => {
          window.removeEventListener('pointermove', move)
          document.removeEventListener('pointerover', over)
          document.documentElement.removeEventListener('pointerleave', leave)
        }
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[95] invisible">
      <span className="cur-ring absolute -left-5 -top-5 block size-10 rounded-full border border-clay/90" />
      <span className="cur-label invisible absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-xs font-semibold text-paper">
        &nbsp;
      </span>
    </div>
  )
}
