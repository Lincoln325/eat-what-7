'use client'

import { useState } from 'react'
import type { Restaurant } from '@/lib/types'

export function useSwipeDeck(restaurants: Restaurant[]) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentCard = restaurants[currentIndex] ?? null
  const nextCard = restaurants[currentIndex + 1] ?? null
  const isExhausted = currentIndex >= restaurants.length
  const remainingCount = Math.max(0, restaurants.length - currentIndex)

  function advance() {
    setCurrentIndex((i) => i + 1)
  }

  function reset() {
    setCurrentIndex(0)
  }

  return { currentCard, nextCard, isExhausted, remainingCount, advance, reset }
}
