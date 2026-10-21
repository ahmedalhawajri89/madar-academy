import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { content, type Content, type Lang } from './content'

type LangValue = {
  lang: Lang
  t: Content
  dir: 'rtl' | 'ltr'
  /** Multiply horizontal motion by this so "forward" follows the reading direction. */
  sign: 1 | -1
  toggle: () => void
}

const LangCtx = createContext<LangValue | null>(null)
const STORAGE_KEY = 'madar-lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ar' || saved === 'en') return saved
  } catch {
    /* storage unavailable */
  }
  return 'ar'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useLayoutEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.title =
      lang === 'ar'
        ? 'أكاديمية مدار للتدريب والتطوير | دورات معتمدة ومسارات مهنية'
        : 'Madar Academy | Accredited courses & career tracks'
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* storage unavailable */
    }
  }, [lang, dir])

  const toggle = useCallback(() => setLang((l) => (l === 'ar' ? 'en' : 'ar')), [])

  const value = useMemo<LangValue>(
    () => ({ lang, t: content[lang], dir, sign: dir === 'rtl' ? -1 : 1, toggle }),
    [lang, dir, toggle],
  )

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangCtx)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
