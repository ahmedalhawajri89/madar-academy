import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Languages, Menu, X } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared } from '../../i18n/content'
import { gsap, MQ, prefersReducedMotion, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { lockScroll, scrollToId } from '../../lib/scroll'
import { Button } from '../ui/Button'
import { Logo, Social } from '../ui/Icons'

export function Navbar() {
  const { t, toggle } = useLang()
  const navRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Glass state on scroll + hide on scroll down / reveal on scroll up
  useGSAP(
    () => {
      const nav = navRef.current!
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.from(nav, { yPercent: -120, duration: 1, delay: 0.3, ease: 'expo.out' })
      })
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        // Also runs after load / restored scroll position, not only on user scroll
        onRefresh: (self) => setScrolled(self.scroll() > 40),
        onUpdate(self) {
          const y = self.scroll()
          setScrolled(y > 40)
          if (openRef.current || prefersReducedMotion()) return
          if (self.direction === 1 && y > 360) gsap.to(nav, { yPercent: -130, duration: 0.45, ease: 'power2.out', overwrite: 'auto' })
          else if (self.direction === -1) gsap.to(nav, { yPercent: 0, duration: 0.45, ease: 'power2.out', overwrite: 'auto' })
        },
      })
      return () => mm.revert()
    },
    { scope: navRef },
  )

  // Full-screen mobile menu: circular clip-path reveal from the menu button
  const { contextSafe } = useGSAP({ scope: menuRef })
  const animateMenu = contextSafe((toOpen: boolean) => {
    const menu = menuRef.current!
    const r = menuBtnRef.current!.getBoundingClientRect()
    const origin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`
    const d = prefersReducedMotion() ? 0 : 1
    if (toOpen) {
      gsap.set(menu, { autoAlpha: 1 })
      gsap.fromTo(menu, { clipPath: `circle(0px at ${origin})` }, { clipPath: `circle(150% at ${origin})`, duration: 0.8 * d, ease: 'power3.inOut' })
      gsap.from('.menu-item', { y: 48, autoAlpha: 0, duration: 0.7 * d, stagger: 0.05, delay: 0.25 * d, ease: 'expo.out' })
    } else {
      gsap.to(menu, {
        clipPath: `circle(0px at ${origin})`,
        duration: 0.6 * d,
        ease: 'power3.inOut',
        onComplete: () => {
          gsap.set(menu, { autoAlpha: 0 })
        },
      })
    }
  })

  const setMenu = (next: boolean) => {
    openRef.current = next
    setOpen(next)
    lockScroll(next)
    animateMenu(next)
    if (next) {
      gsap.to(navRef.current, { yPercent: 0, duration: 0.2 })
      setTimeout(() => closeBtnRef.current?.focus(), 50)
    } else {
      menuBtnRef.current?.focus()
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => () => lockScroll(false), [])

  const go = (e: MouseEvent, id: string) => {
    e.preventDefault()
    if (openRef.current) setMenu(false)
    scrollToId(id)
  }

  return (
    <>
      <header ref={navRef} className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-4">
        <div className="container-x">
          <nav
            aria-label="Main"
            className={`flex h-16 items-center justify-between gap-4 rounded-full ps-4 pe-2 transition-[background-color,box-shadow,color] duration-500 md:ps-6 ${
              scrolled
                ? 'bg-paper/80 text-ink shadow-[0_8px_30px_-12px_rgb(14_33_28/0.25)] ring-1 ring-ink/5 backdrop-blur-xl'
                : 'bg-transparent text-ink'
            }`}
          >
            <a href="#top" onClick={(e) => go(e, 'top')} aria-label={t.brand.full} className="shrink-0 rounded-full">
              <Logo name={t.brand.name} />
            </a>

            <ul className="hidden items-center gap-1 lg:flex">
              {t.nav.links.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => go(e, l.id)}
                    className={`relative rounded-full px-3.5 py-2 text-[0.95rem] font-medium transition-colors text-ink/75 hover:bg-ink/5 hover:text-ink`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggle}
                aria-label={t.nav.langLabel}
                className={`inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 font-display text-sm font-semibold transition-colors hover:bg-ink/5`}
              >
                <Languages className="size-4" aria-hidden />
                {t.nav.lang}
              </button>
              <span className="hidden sm:block">
                <Button href="#contact" variant="dark" magnetic>
                  {t.nav.cta}
                </Button>
              </span>
              <button
                ref={menuBtnRef}
                type="button"
                onClick={() => setMenu(true)}
                aria-label={t.nav.menu}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className={`grid size-12 place-items-center rounded-full transition-colors lg:hidden bg-ink text-paper hover:bg-pine`}
              >
                <Menu className="size-5" aria-hidden />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.menu}
        className="invisible fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink text-paper lg:hidden"
        style={{ clipPath: 'circle(0px at 0 0)' }}
      >
        <div className="container-x relative flex h-[76px] items-center justify-between pt-3">
          <Logo name={t.brand.name} tone="light" />
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setMenu(false)}
            aria-label={t.nav.close}
            className="grid size-12 place-items-center rounded-full bg-paper/10 hover:bg-paper/20"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <ul className="container-x relative mt-8 flex flex-col gap-1">
          {t.nav.links.map((l, i) => (
            <li key={l.id} className="menu-item overflow-hidden border-b border-paper/10">
              <a href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="flex items-baseline gap-4 py-4 font-display text-3xl font-semibold sm:text-4xl">
                <span className="text-sm font-medium text-lime tabular-nums">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="container-x relative mt-auto flex flex-col gap-6 pb-10 pt-10">
          <div className="menu-item">
            <Button href="#contact" variant="lime" size="lg" onClick={() => setMenu(false)} className="w-full">
              {t.nav.cta}
            </Button>
          </div>
          <div className="menu-item flex items-center justify-between text-paper/70">
            <span className="text-sm">{t.nav.menuContact}</span>
            <div className="flex gap-2">
              {(['instagram', 'linkedin', 'youtube'] as const).map((k) => {
                const G = Social[k]
                return (
                  <a key={k} href="#" aria-label={k} className="grid size-11 place-items-center rounded-full bg-paper/10 hover:bg-paper/20">
                    <G className="size-5" />
                  </a>
                )
              })}
              <a href={shared.whatsapp} target="_blank" rel="noopener noreferrer" className="sr-only">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
