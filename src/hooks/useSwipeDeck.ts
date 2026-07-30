'use client'

import { useMemo, useState } from 'react'
import type { Restaurant } from '@/lib/types'

// Track progress by swiped card id, not by numeric index. The list can reorder
// or grow mid-session (seeded shuffle refetch, a fresh add), which shifts array
// positions — an index would then point at a different card. Keying on id keeps
// the current card stable and lets newly-added restaurants surface as unseen.
export function useSwipeDeck(restaurants: Restaurant[]) {
  const [swiped, setSwiped] = useState<Set<string>>(new Set())

  const unseen = useMemo(
    () => restaurants.filter((r) => !swiped.has(r.id)),
    [restaurants, swiped],
  )

  const currentCard = unseen[0] ?? null
  const nextCard = unseen[1] ?? null
  const isExhausted = unseen.length === 0
  const remainingCount = unseen.length

  function advance() {
    if (currentCard) setSwiped((prev) => new Set(prev).add(currentCard.id))
  }

  function reset() {
    setSwiped(new Set())
  }

  return { currentCard, nextCard, isExhausted, remainingCount, advance, reset }
}
