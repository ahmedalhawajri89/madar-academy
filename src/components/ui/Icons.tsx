import { Briefcase, ChartLine, Code, Languages, Megaphone, PenTool, Sparkles, type LucideIcon } from 'lucide-react'
import { useState, type ImgHTMLAttributes, type SVGProps } from 'react'
import type { IconKey } from '../../i18n/content'

export const categoryIcon: Record<IconKey, LucideIcon> = {
  dev: Code,
  design: PenTool,
  data: ChartLine,
  business: Briefcase,
  marketing: Megaphone,
  lang: Languages,
  ai: Sparkles,
}

/** Brand mark: a planet with a tilted orbit and a satellite. */
export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="18" fill="currentColor" className="text-ink" />
      <ellipse cx="32" cy="32" rx="22" ry="10" fill="none" stroke="#CDEF6A" strokeWidth="3" transform="rotate(-28 32 32)" />
      <circle cx="32" cy="32" r="8" fill="#F4EFE4" />
      <circle cx="50" cy="21" r="4.5" fill="#DD5F37" />
    </svg>
  )
}

export function Logo({ name, tone = 'dark' }: { name: string; tone?: 'dark' | 'light' }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-xl font-bold tracking-tight ${tone === 'light' ? 'text-paper' : 'text-ink'}`}>{name}</span>
    </span>
  )
}

/** Image with a soft branded fallback if the remote photo fails to load. */
export function Photo({ alt, className = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    const initials = (alt ?? '?').replace(/^(م\.|د\.|Eng\.|Dr\.)\s*/, '').split(' ').map((w) => w[0]).slice(0, 2).join('')
    return (
      <span role="img" aria-label={alt} className={`grid place-items-center bg-pine font-display font-bold text-lime ${className}`}>
        {initials}
      </span>
    )
  }
  return <img alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" decoding="async" {...rest} />
}

/* Minimal social glyphs (lucide no longer ships brand icons) */
type G = SVGProps<SVGSVGElement>
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const Social = {
  instagram: (p: G) => (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  ),
  linkedin: (p: G) => (
    <svg {...base} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.5v.01M11.5 16v-5.5M11.5 13c0-1.6 1-2.5 2.3-2.5S16 11.4 16 13v3" />
    </svg>
  ),
  x: (p: G) => (
    <svg {...base} {...p}>
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  ),
  youtube: (p: G) => (
    <svg {...base} {...p}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
    </svg>
  ),
  facebook: (p: G) => (
    <svg {...base} {...p}>
      <path d="M14.5 8H17V4.5h-2.5A3.5 3.5 0 0 0 11 8v2.5H8.5V14H11v6h3.5v-6H17l.5-3.5h-3V8.5c0-.3.2-.5.5-.5z" />
    </svg>
  ),
}

export function Stars({ value = 5, className = 'size-4' }: { value?: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" className={className} fill={i < Math.round(value) ? '#E3A93B' : 'currentColor'} opacity={i < Math.round(value) ? 1 : 0.25}>
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z" />
        </svg>
      ))}
    </span>
  )
}
