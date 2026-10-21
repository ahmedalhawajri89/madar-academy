import { useRef, type MouseEvent, type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap, MQ, useGSAP } from '../../lib/gsap'
import { scrollToId } from '../../lib/scroll'

type Variant = 'lime' | 'dark' | 'ghost' | 'ghostLight' | 'paper'

const variants: Record<Variant, { base: string; icon: string }> = {
  lime: { base: 'bg-lime text-ink hover:bg-lime-2', icon: 'bg-ink text-lime' },
  dark: { base: 'bg-ink text-paper hover:bg-pine', icon: 'bg-lime text-ink' },
  paper: { base: 'bg-paper text-ink hover:bg-ivory', icon: 'bg-ink text-lime' },
  ghost: { base: 'border border-ink/15 text-ink hover:bg-ink/5', icon: 'bg-ink/10 text-ink' },
  ghostLight: { base: 'border border-paper/25 text-paper hover:bg-paper/10', icon: 'bg-paper/15 text-paper' },
}

type Props = {
  children: ReactNode
  variant?: Variant
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  arrow?: boolean
  magnetic?: boolean
  size?: 'md' | 'lg'
  className?: string
  disabled?: boolean
  external?: boolean
}

export function Button({
  children,
  variant = 'dark',
  href,
  onClick,
  type = 'button',
  arrow = true,
  magnetic = false,
  size = 'md',
  className = '',
  disabled,
  external,
}: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  const v = variants[variant]

  // Magnetic pull toward the cursor (fine pointers only, never with reduced motion)
  useGSAP(
    () => {
      if (!magnetic || !ref.current) return
      const el = ref.current
      const mm = gsap.matchMedia()
      mm.add(MQ.finePointer, () => {
        const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          xTo((e.clientX - (r.left + r.width / 2)) * 0.28)
          yTo((e.clientY - (r.top + r.height / 2)) * 0.38)
        }
        const leave = () => {
          xTo(0)
          yTo(0)
        }
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        return () => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
        }
      })
      return () => mm.revert()
    },
    { dependencies: [magnetic] },
  )

  const sizing =
    size === 'lg'
      ? `h-14 text-base ${arrow ? 'ps-7 pe-2' : 'px-7'}`
      : `h-12 text-[0.95rem] ${arrow ? 'ps-5 pe-1.5' : 'px-5'}`
  const cls = `group/btn relative inline-flex items-center justify-center gap-3 rounded-full font-display font-semibold whitespace-nowrap transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${sizing} ${v.base} ${className}`

  const inner = (
    <>
      <span>{children}</span>
      {arrow && (
        <span
          aria-hidden
          className={`grid place-items-center rounded-full ${size === 'lg' ? 'size-10' : 'size-9'} ${v.icon} transition-transform duration-500 ease-[var(--ease-out-expo)] ltr:group-hover/btn:-rotate-45 rtl:group-hover/btn:rotate-45`}
        >
          <ArrowRight className="size-4 rtl:-scale-x-100" strokeWidth={2.25} />
        </span>
      )}
    </>
  )

  if (href) {
    const handle = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.()
      if (href.startsWith('#')) {
        e.preventDefault()
        scrollToId(href.slice(1))
      }
    }
    return (
      <a
        ref={ref}
        href={href}
        onClick={handle}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    )
  }

  return (
    <button ref={ref} type={type} onClick={onClick} className={cls} disabled={disabled}>
      {inner}
    </button>
  )
}
