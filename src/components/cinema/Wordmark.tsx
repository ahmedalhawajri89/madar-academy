import { useRef } from 'react'
import { useLang } from '../../i18n/LangContext'
import { gsap, MQ, ScrollTrigger, SplitText, useGSAP } from '../../lib/gsap'

const BASE_W = 250 // resting weight (Alexandria is variable: 100–900)
const PEAK_W = 900
const REACH = 260 // px of cursor influence

/**
 * The closing title of the film: the brand name as a living, variable-font wordmark.
 *  - three stacked layers: hairline outline · gradient fill that sweeps in with scroll · cursor spotlight
 *  - Latin letters swell toward the cursor (or ripple in a wave on touch / when idle);
 *    the Arabic word breathes as one unit so its letters stay joined
 *  - the Madar orbit draws itself around the name, a satellite circling it on a MotionPath
 */
export function Wordmark() {
  const { t, lang } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const name = t.brand.name
  const perChar = lang !== 'ar'

  useGSAP(
    () => {
      const root = ref.current!
      const stack = root.querySelector<HTMLElement>('.wm-stack')!
      const layers = ['.wm-outline', '.wm-fill', '.wm-spot'].map((s) => root.querySelector<HTMLElement>(s)!)
      const spot = layers[2]
      const footer = root.closest('footer') ?? root
      const mm = gsap.matchMedia()

      mm.add({ motion: MQ.motion, fine: MQ.finePointer }, (ctx) => {
        const { motion, fine } = ctx.conditions as { motion: boolean; fine: boolean }
        if (!motion) return // reduced motion: the static, fully filled wordmark from CSS

        // Split every layer the same way so their glyphs keep identical widths while weights change
        const units: HTMLElement[][] = perChar
          ? layers.map((l) => SplitText.create(l, { type: 'chars' }).chars as HTMLElement[])
          : layers.map((l) => [l])
        const count = units[0].length
        const weight = Array.from({ length: count }, (_, i) =>
          units.map((u) => gsap.quickTo(u[i], 'fontWeight', { duration: 0.7, ease: 'power3.out' })),
        )
        const setWeight = (i: number, w: number) => weight[i].forEach((to) => to(w))
        gsap.set(units.flat(), { fontWeight: BASE_W })

        // Entrance: rises out of a blur as the credits reach it
        gsap.fromTo(
          stack,
          { yPercent: 35, autoAlpha: 0, filter: 'blur(18px)' },
          {
            yPercent: 0,
            autoAlpha: 1,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top bottom', end: 'center 70%', scrub: 0.6 },
          },
        )

        // Gradient ink sweeps through the name in the reading direction, completing at the very end
        const rtl = document.documentElement.dir === 'rtl'
        gsap.fromTo(
          layers[1],
          { clipPath: rtl ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            scrollTrigger: { trigger: root, start: 'top 85%', end: 'bottom bottom', scrub: 0.8 },
          },
        )

        // Orbit draws around the name; the satellite fades in and keeps circling
        gsap.fromTo(
          '.wm-path',
          { drawSVG: '0%' },
          { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: root, start: 'top 80%', end: 'bottom bottom', scrub: 0.8 } },
        )
        gsap.to('.wm-sat', {
          motionPath: { path: '.wm-path', align: '.wm-path', alignOrigin: [0.5, 0.5] },
          duration: 14,
          ease: 'none',
          repeat: -1,
        })
        gsap.fromTo('.wm-sat', { autoAlpha: 0 }, { autoAlpha: 1, scrollTrigger: { trigger: root, start: 'center bottom', end: 'bottom bottom', scrub: true } })

        // Idle ripple (also the only mode on touch screens)
        let pointerActive = false
        const ripple = (time: number) => {
          if (pointerActive) return
          for (let i = 0; i < count; i++) {
            const wave = 0.5 + 0.5 * Math.sin(time * 1.5 - i * 0.7)
            setWeight(i, BASE_W + (PEAK_W - 350 - BASE_W) * wave)
          }
        }
        ScrollTrigger.create({
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? gsap.ticker.add(ripple) : gsap.ticker.remove(ripple)),
        })

        if (!fine) return () => gsap.ticker.remove(ripple)

        // Cursor: proximity swells the nearest letters, a spotlight lights the name beneath it
        const light = { x: 0, y: 0, r: 0 }
        const paint = () => {
          spot.style.setProperty('--sx', `${light.x}px`)
          spot.style.setProperty('--sy', `${light.y}px`)
          spot.style.setProperty('--r', `${light.r}px`)
        }
        const lx = gsap.quickTo(light, 'x', { duration: 0.5, ease: 'power3.out', onUpdate: paint })
        const ly = gsap.quickTo(light, 'y', { duration: 0.5, ease: 'power3.out', onUpdate: paint })

        const move = (e: PointerEvent) => {
          pointerActive = true
          const box = spot.getBoundingClientRect()
          lx(e.clientX - box.left)
          ly(e.clientY - box.top)
          gsap.to(light, { r: 300, duration: 0.6, ease: 'power3.out', overwrite: 'auto', onUpdate: paint })
          for (let i = 0; i < count; i++) {
            const r = units[0][i].getBoundingClientRect()
            const d = Math.hypot(e.clientX - (r.left + r.width / 2), (e.clientY - (r.top + r.height / 2)) * 0.6)
            const reach = perChar ? REACH : r.width * 0.75
            const pull = Math.pow(Math.max(0, 1 - d / reach), 1.4)
            setWeight(i, BASE_W + (PEAK_W - BASE_W) * pull)
          }
        }
        const leave = () => {
          pointerActive = false
          gsap.to(light, { r: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto', onUpdate: paint })
        }
        footer.addEventListener('pointermove', move as EventListener)
        footer.addEventListener('pointerleave', leave)
        return () => {
          gsap.ticker.remove(ripple)
          footer.removeEventListener('pointermove', move as EventListener)
          footer.removeEventListener('pointerleave', leave)
        }
      })

      return () => mm.revert()
    },
    { scope: ref, dependencies: [lang] },
  )

  const layer = 'col-start-1 row-start-1 whitespace-nowrap'

  return (
    <div ref={ref} aria-hidden className="pointer-events-none relative mt-16 select-none">
      {/* Orbit around the name */}
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-x-[-3%] top-[8%] h-[84%] w-[106%] -rotate-3 overflow-visible">
        <path className="wm-path" d="M20,150 a480,120 0 1,0 960,0 a480,120 0 1,0 -960,0" fill="none" stroke="rgb(205 239 106 / 0.35)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="wm-sat absolute left-0 top-0 z-10 block size-3.5 rounded-full bg-lime shadow-[0_0_24px_6px_rgb(205_239_106/0.55)] motion-reduce:hidden" />

      <div className="wm-stack grid justify-center text-center font-display text-[clamp(5rem,22vw,18rem)] font-extrabold leading-[1.05]">
        <span className={`wm-outline ${layer} text-transparent [-webkit-text-stroke:1px_rgb(255_252_244/0.2)]`}>{name}</span>
        <span className={`wm-fill ${layer} bg-gradient-to-r from-lime via-mustard to-clay bg-clip-text text-transparent`}>{name}</span>
        <span
          className={`wm-spot ${layer} text-paper`}
          style={{
            maskImage: 'radial-gradient(circle var(--r, 0px) at var(--sx, 50%) var(--sy, 50%), #000 0%, rgb(0 0 0 / 0.6) 35%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle var(--r, 0px) at var(--sx, 50%) var(--sy, 50%), #000 0%, rgb(0 0 0 / 0.6) 35%, transparent 100%)',
          }}
        >
          {name}
        </span>
      </div>
    </div>
  )
}
