import { gsap, prefersReducedMotion, ScrollTrigger } from './gsap'
import { jumpToId, scrollToId } from './scroll'

/**
 * Cinematic "title card" cut between chapters: a curtain wipes in the travel
 * direction, shows the chapter name, the page jumps behind it, and the curtain
 * wipes out. Short distances just glide with smooth scroll.
 */
let card: HTMLDivElement | null = null
let busy = false

function getCard() {
  if (card && document.body.contains(card)) return card
  card = document.createElement('div')
  card.className = 'title-card'
  card.setAttribute('aria-hidden', 'true')
  card.innerHTML =
    '<div class="tc-inner"><span class="tc-kicker"></span><span class="tc-mask"><span class="tc-title"></span></span><span class="tc-line"></span></div>'
  document.body.appendChild(card)
  return card
}

export function travelTo(id: string, kicker: string, title: string) {
  const target = id === 'top' ? document.body : document.getElementById(id)
  if (!target) return
  const top = id === 'top' ? -window.scrollY : target.getBoundingClientRect().top
  if (busy) return
  if (prefersReducedMotion() || Math.abs(top) < window.innerHeight * 1.1) {
    scrollToId(id)
    return
  }

  busy = true
  const el = getCard()
  const kick = el.querySelector<HTMLElement>('.tc-kicker')!
  const ttl = el.querySelector<HTMLElement>('.tc-title')!
  const line = el.querySelector<HTMLElement>('.tc-line')!
  kick.textContent = kicker
  ttl.textContent = title
  const down = top > 0
  const hidden = down ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)'
  const gone = down ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)'

  gsap
    .timeline({
      onComplete: () => {
        busy = false
        gsap.set(el, { autoAlpha: 0 })
      },
    })
    .set(el, { autoAlpha: 1, clipPath: hidden })
    .to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'madar.inOut' })
    .fromTo(ttl, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'madar.out' }, '-=0.3')
    .fromTo(kick, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '<')
    .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'madar.inOut' }, '<')
    .call(() => {
      jumpToId(id)
      ScrollTrigger.update()
    })
    .to(ttl, { yPercent: -110, duration: 0.5, ease: 'power3.in' }, '+=0.35')
    .to(kick, { autoAlpha: 0, duration: 0.3 }, '<')
    .to(el, { clipPath: gone, duration: 0.85, ease: 'madar.inOut' }, '-=0.15')
}
