'use client'

import { useState } from 'react'
import type { Restaurant } from '@/lib/types'

export const MAX_SELECTION = 3

export function useSelection() {
  const [selected, setSelected] = useState<Restaurant[]>([])

  function addToSelection(restaurant: Restaurant) {
    if (selected.length >= MAX_SELECTION) return
    if (selected.some((r) => r.id === restaurant.id)) return
    setSelected((prev) => [...prev, restaurant])
  }

  function removeFromSelection(id: string) {
    setSelected((prev) => prev.filter((r) => r.id !== id))
  }

  function clearSelection() {
    setSelected([])
  }

  return { selected, addToSelection, removeFromSelection, clearSelection }
}
