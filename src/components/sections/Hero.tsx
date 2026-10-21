import { useRef, useState, type ReactNode } from 'react'
import { BadgeCheck, CalendarClock, Pause, Play } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { gsap, MQ, prefersReducedMotion, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { HERO_SHAPES } from '../../lib/heroShapes'
import { onIntro } from '../../lib/intro'
import { ParticleField } from '../../lib/particles'
import { scrollToId } from '../../lib/scroll'
import { Button } from '../ui/Button'
import { Photo, Stars } from '../ui/Icons'
import { Eyebrow } from '../ui/SectionHeading'

const FIELDS = 5
const HOLD_SECONDS = 3.6

export function Hero() {
  const { t } = useLang()
  const h = t.hero
  const ref = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<ParticleField | null>(null)
  const timerRef = useRef<gsap.core.Tween | null>(null)
  const activeRef = useRef(0)
  const pausedRef = useRef(false)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useGSAP(
    () => {
      const section = ref.current!
      const canvas = canvasRef.current!
      const reduced = prefersReducedMotion()
      const vw = window.innerWidth
      const field = new ParticleField(canvas, HERO_SHAPES, {
        count: vw >= 1024 ? 2600 : vw >= 640 ? 1900 : 1200,
        colors: ['#0E211C', '#DD5F37', '#1F5673'],
        weights: [75, 17, 8],
        reduced,
      })
      fieldRef.current = field
      if (import.meta.env.DEV) Object.assign(window, { __madarParticles: field })
      const ro = new ResizeObserver(() => field.resize())
      ro.observe(canvas)

      gsap.set('.hero-word', { autoAlpha: (i: number) => (i === 0 ? 1 : 0) })

      const mm = gsap.matchMedia()

      mm.add(MQ.motion, () => {
        field.strew()
        field.start()

        // Intro: particles gather into the Madar logo while the copy rises, then the field cycle begins.
        // Held until the opening title (preloader) lifts.
        const intro = gsap
          .timeline({ paused: true, defaults: { ease: 'madar.out', duration: 1 } })
          .call(() => field.morphTo(0, 2.2), [], 0.1)
          .from('.hero-eyebrow', { y: 20, autoAlpha: 0 }, 0.2)
          .from('.hero-line', { yPercent: 115, duration: 1.2, stagger: 0.12 }, 0.3)
          .from('.hero-word-0 .word-line', { drawSVG: '0%', duration: 0.9, ease: 'power2.inOut' }, 1.1)
          .from('.hero-sub', { y: 24, autoAlpha: 0 }, 0.65)
          .from('.hero-cta > *', { y: 24, autoAlpha: 0, stagger: 0.1 }, 0.8)
          .from('.hero-trust', { y: 16, autoAlpha: 0 }, 0.95)
          .from('.hero-ui', { y: 16, autoAlpha: 0 }, 1.5)
          .from('.float-card', { y: 30, autoAlpha: 0, scale: 0.92, stagger: 0.15, ease: 'back.out(1.4)' }, 1.7)
          .call(() => goTo(0, true), [], 3)
        const offIntro = onIntro(() => intro.play())

        gsap.to('.hero-orbit', { rotation: 360, duration: 120, repeat: -1, ease: 'none', svgOrigin: '50 50' })

        // Only animate while the hero is on screen
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            if (self.isActive) {
              field.start()
              timerRef.current?.resume()
            } else {
              field.stop()
              timerRef.current?.pause()
            }
          },
        })
        // Scrolling away disperses the particles (starts once the stage itself reaches the top)
        ScrollTrigger.create({
          trigger: canvas,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => field.setScatter(self.progress),
        })
        return offIntro
      })

      // Scene change (desktop): the hero holds still and recedes into the dark — smaller, rounded,
      // dimmed — while the next chapter slides over it like a new shot.
      mm.add(MQ.desktop, () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section.parentElement,
              start: 'bottom bottom',
              end: '+=100%',
              pin: true,
              pinSpacing: false,
              scrub: true,
            },
          })
          .to(section, { scale: 0.86, borderRadius: 48, yPercent: -4, ease: 'none' }, 0)
          .to('.hero-dim', { opacity: 0.55, ease: 'none' }, 0)
      })

      mm.add(MQ.reduce, () => {
        field.morphTo(1)
        setCaption(0, true)
      })

      // Cursor: particles part around it, a warm glow follows, cards drift with depth
      mm.add(MQ.finePointer, () => {
        const glow = section.querySelector<HTMLElement>('.hero-glow')!
        const s0 = section.getBoundingClientRect()
        const g0 = glow.getBoundingClientRect()
        const restX = g0.left + g0.width / 2 - s0.left
        const restY = g0.top + g0.height / 2 - s0.top
        const gx = gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3.out' })
        const gy = gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3.out' })
        const cards = gsap.utils.toArray<HTMLElement>('[data-depth]').map((el) => ({
          depth: Number(el.dataset.depth),
          x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }),
        }))
        const move = (e: PointerEvent) => {
          field.setPointer(e.clientX, e.clientY)
          const r = section.getBoundingClientRect()
          gx(e.clientX - r.left - restX)
          gy(e.clientY - r.top - restY)
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          cards.forEach((c) => {
            c.x(nx * c.depth * 50)
            c.y(ny * c.depth * 50)
          })
        }
        const leave = () => field.clearPointer()
        section.addEventListener('pointermove', move)
        section.addEventListener('pointerleave', leave)
        return () => {
          section.removeEventListener('pointermove', move)
          section.removeEventListener('pointerleave', leave)
        }
      })

      return () => {
        // The cycle helpers below run outside this context (timers, clicks), so clean them up explicitly
        timerRef.current?.kill()
        gsap.killTweensOf(section.querySelectorAll('.hero-word, .word-line, .hero-caption'))
        mm.revert()
        ro.disconnect()
        field.destroy()
        fieldRef.current = null
      }
    },
    { scope: ref },
  )

  const setCaption = (i: number, instant = false) => {
    const el = ref.current?.querySelector('.hero-caption')
    if (!el) return
    const text = `[ 0${i + 1} ] ${h.captions[i]}`
    if (instant || prefersReducedMotion()) el.textContent = text
    else gsap.to(el, { duration: 0.9, scrambleText: { text, chars: 'upperCase', speed: 0.5, revealDelay: 0.25 }, overwrite: true })
  }

  const swapWord = (from: number, to: number) => {
    const words = ref.current!.querySelectorAll<HTMLElement>('.hero-word')
    if (prefersReducedMotion()) {
      gsap.set(words, { autoAlpha: (i: number) => (i === to ? 1 : 0) })
      return
    }
    gsap.to(words[from], { yPercent: -100, autoAlpha: 0, filter: 'blur(8px)', duration: 0.55, ease: 'power3.in', overwrite: true })
    gsap.fromTo(
      words[to],
      { yPercent: 100, autoAlpha: 0, filter: 'blur(8px)' },
      { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', delay: 0.3, overwrite: true },
    )
    gsap.fromTo(words[to].querySelector('.word-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut', delay: 0.75 })
  }

  const schedule = () => {
    timerRef.current?.kill()
    timerRef.current = null
    if (pausedRef.current || prefersReducedMotion()) return
    timerRef.current = gsap.delayedCall(HOLD_SECONDS, () => goTo((activeRef.current + 1) % FIELDS))
  }

  /** Move to field i: particles morph, the headline word swaps, the caption scrambles. */
  const goTo = (i: number, force = false) => {
    const prev = activeRef.current
    if (i === prev && !force) return
    if (i !== prev) swapWord(prev, i)
    activeRef.current = i
    setActive(i)
    fieldRef.current?.morphTo(i + 1)
    setCaption(i)
    schedule()
  }

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setPaused(pausedRef.current)
    if (pausedRef.current) timerRef.current?.kill()
    else schedule()
  }

  return (
    <div className="hero-shell bg-ink">
    <section id="top" ref={ref} className="relative isolate origin-top overflow-hidden bg-ivory pb-16 pt-28 md:pt-32 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-20">
      <div aria-hidden className="hero-dim pointer-events-none absolute inset-0 z-30 bg-ink opacity-0" />
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute end-[22%] top-[45%] -z-10 size-[760px] -translate-y-1/2 rounded-full ltr:translate-x-1/2 rtl:-translate-x-1/2"
        style={{ background: 'radial-gradient(circle, rgb(221 95 55 / 0.16), rgb(205 239 106 / 0.08) 35%, transparent 62%)' }}
      />

      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        {/* Copy */}
        <div className="relative z-10">
          <div className="hero-eyebrow">
            <Eyebrow>{h.eyebrow}</Eyebrow>
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.7rem,6.6vw,5.6rem)] font-extrabold leading-[1.2] text-ink ltr:leading-[1.04]">
            <span className="sr-only">{h.srTitle}</span>
            <span aria-hidden>
              <span className="block overflow-hidden py-[0.06em]">
                <span className="hero-line flex items-baseline gap-[0.28em]">
                  <span>{h.learn}</span>
                  <span className="-my-[0.18em] inline-grid overflow-hidden py-[0.18em]">
                    {h.words.map((w, i) => (
                      <span key={w} className={`hero-word hero-word-${i} relative col-start-1 row-start-1 justify-self-start whitespace-nowrap text-clay ${i ? 'invisible' : ''}`}>
                        {w}
                        <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-[0.06em] h-[0.2em] w-full rtl:-scale-x-100">
                          <path className="word-line" d="M4 16 C 70 4, 170 4, 296 14" fill="none" stroke="#0E211C" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        </svg>
                      </span>
                    ))}
                  </span>
                </span>
              </span>
              <span className="block overflow-hidden py-[0.06em]">
                <span className="hero-line block">{h.lineB}</span>
              </span>
              <span className="block overflow-hidden py-[0.06em]">
                <span className="hero-line block">{h.lineC}</span>
              </span>
            </span>
          </h1>

          <p className="hero-sub mt-6 max-w-xl text-lg text-mute md:text-xl">{h.sub}</p>

          <div className="hero-cta mt-9 flex flex-wrap items-center gap-3">
            <Button href="#courses" variant="dark" size="lg" magnetic>
              {h.primary}
            </Button>
            <Button href="#contact" variant="ghost" size="lg" arrow={false}>
              {h.secondary}
            </Button>
          </div>

          <div className="hero-trust mt-10 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {shared.heroAvatars.map((src) => (
                <Photo key={src} src={src} alt="" width={44} height={44} className="size-11 rounded-full object-cover ring-[3px] ring-ivory" />
              ))}
              <span className="grid size-11 place-items-center rounded-full bg-lime font-display text-xs font-bold text-ink ring-[3px] ring-ivory">+12k</span>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-ink">{h.trust}</p>
              <p className="flex items-center gap-2 text-mute">
                <Stars className="size-3.5 text-ink" /> {h.rating}
              </p>
            </div>
          </div>
        </div>

        {/* Particle stage */}
        <div className="relative">
          <div className="relative mx-auto aspect-[5/4] w-full max-w-[600px] sm:aspect-square" data-depth="0.12">
            <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-[3%] size-[94%] text-ink/15">
              <g className="hero-orbit">
                <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.18" strokeDasharray="0.5 1.6" />
                <circle cx="99" cy="50" r="0.9" fill="#DD5F37" />
              </g>
            </svg>
            <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
          </div>

          <div className="hero-ui mx-auto mt-3 flex max-w-[600px] items-center justify-between gap-4">
            <p aria-hidden dir="ltr" className="hero-caption whitespace-nowrap font-mono text-[0.7rem] sm:min-w-[17ch] sm:text-xs font-semibold tracking-[0.18em] text-ink/70">
              [ 01 ] {h.captions[0]}
            </p>
            <div className="flex items-center">
              {h.words.map((w, i) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${h.showField}: ${w}`}
                  aria-pressed={active === i}
                  className="grid size-9 place-items-center"
                >
                  <span className={`block h-2 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)] ${active === i ? 'w-6 bg-clay' : 'w-2 bg-ink/25 hover:bg-ink/50'}`} />
                </button>
              ))}
              <button
                type="button"
                onClick={togglePause}
                aria-label={paused ? h.play : h.pause}
                className="ms-1 grid size-11 place-items-center rounded-full text-ink ring-1 ring-ink/15 transition-colors hover:bg-ink/5"
              >
                {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
              </button>
            </div>
          </div>

          <FloatCard className="top-[6%] start-0 hidden sm:block" depth={0.7} icon={<BadgeCheck className="size-5" />} iconCls="bg-lime text-ink" title={h.cardCert} sub={h.cardCertSub} />
          <FloatCard className="bottom-[12%] end-0 sm:bottom-[20%]" depth={1.1} icon={<CalendarClock className="size-5" />} iconCls="bg-clay text-paper" title={h.cardNext} sub={h.cardNextSub} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToId('why')}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-mute hover:text-ink lg:flex"
      >
        {h.scroll}
        <span className="flex h-9 w-5 justify-center rounded-full border border-ink/25 pt-1.5">
          <span className="h-2 w-1 animate-bounce rounded-full bg-clay" />
        </span>
      </button>
    </section>
    </div>
  )
}

function FloatCard({ className, depth, icon, iconCls, title, sub }: { className: string; depth: number; icon: ReactNode; iconCls: string; title: string; sub: string }) {
  return (
    <div data-depth={depth} className={`absolute z-10 ${className}`}>
      <div className="float-card flex items-center gap-3 rounded-2xl bg-paper/85 p-2.5 pe-4 shadow-[0_18px_40px_-18px_rgb(14_33_28/0.35)] ring-1 ring-ink/10 backdrop-blur-xl sm:p-3 sm:pe-5">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl sm:size-11 ${iconCls}`}>{icon}</span>
        <span className="leading-tight">
          <span className="block font-display text-sm font-semibold text-ink sm:text-[0.95rem]">{title}</span>
          <span className="mt-0.5 block text-[0.7rem] text-mute sm:text-xs">{sub}</span>
        </span>
      </div>
    </div>
  )
}
