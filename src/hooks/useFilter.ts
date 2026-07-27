'use client'

import { useState, useMemo } from 'react'
import type { CuisineType, Restaurant } from '@/lib/types'
import { MOCK_RESTAURANTS } from '@/lib/mock-data'

export function useFilter() {
  const [activeFilters, setActiveFilters] = useState<CuisineType[]>([])

  const filteredRestaurants = useMemo<Restaurant[]>(() => {
    if (activeFilters.length === 0) return MOCK_RESTAURANTS
    return MOCK_RESTAURANTS.filter((r) => activeFilters.includes(r.cuisine))
  }, [activeFilters])

  function toggleFilter(cuisine: CuisineType) {
    setActiveFilters((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine],
    )
  }

  function clearFilters() {
    setActiveFilters([])
  }

  return { activeFilters, filteredRestaurants, toggleFilter, clearFilters }
}
