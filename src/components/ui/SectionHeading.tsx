import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: string
  sub?: string
  tone?: 'light' | 'dark'
  align?: 'start' | 'center'
  className?: string
  children?: ReactNode
}

export function Eyebrow({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-sm font-medium ${
        tone === 'dark' ? 'bg-paper/10 text-paper/85 ring-1 ring-paper/15' : 'bg-ink/[0.06] text-pine ring-1 ring-ink/10'
      }`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${tone === 'dark' ? 'bg-lime' : 'bg-clay'}`} />
      {children}
    </span>
  )
}

export function SectionHeading({ eyebrow, title, sub, tone = 'light', align = 'start', className = '', children }: Props) {
  const center = align === 'center'
  return (
    <div className={`${center ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl'} ${className}`}>
      <div data-reveal>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      </div>
      <h2
        data-split
        className={`mt-5 text-[clamp(1.85rem,4.2vw,3.4rem)] font-bold ${tone === 'dark' ? 'text-paper' : 'text-ink'}`}
      >
        {title}
      </h2>
      {sub && (
        <p data-reveal className={`mt-4 text-lg ${tone === 'dark' ? 'text-paper/70' : 'text-mute'} ${center ? 'mx-auto max-w-xl' : ''}`}>
          {sub}
        </p>
      )}
      {children}
    </div>
  )
}
