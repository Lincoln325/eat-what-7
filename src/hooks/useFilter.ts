'use client'

import { useState } from 'react'

// Multi-select cuisine filter, using CUISINE_FILTERS keys. Matches the
// comma-separated `cuisine` query param /api/restaurants accepts.
export function useFilter() {
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  function toggleFilter(key: string) {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  function clearFilters() {
    setActiveFilters([])
  }

  return { activeFilters, toggleFilter, clearFilters }
}
