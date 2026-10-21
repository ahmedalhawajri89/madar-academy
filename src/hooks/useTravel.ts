import { useCallback } from 'react'
import { useLang } from '../i18n/LangContext'
import { travelTo } from '../lib/travel'

/** Navigate to a section with the chapter title card ("الفصل 07 — المدرّبون"). */
export function useTravel() {
  const { t } = useLang()
  return useCallback(
    (id: string) => {
      const i = t.chapters.findIndex((c) => c.id === id)
      const chapter = t.chapters[i]
      const kicker = i >= 0 ? `${t.chapterWord} ${String(i + 1).padStart(2, '0')}` : ''
      travelTo(id, kicker, chapter?.label ?? t.brand.name)
    },
    [t],
  )
}
