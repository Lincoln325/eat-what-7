'use client'

import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import type { Restaurant } from '@/lib/types'
import { fetchRestaurantsPage, PAGE_SIZE, type Coords } from '@/lib/api/restaurants-client'

type RestaurantsKey = readonly [string, string, string, string, number]

function getKey(cuisineKeys: string[], seed: string, coords: Coords | null) {
  const coordKey = coords ? `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)}` : ''
  return (pageIndex: number, previousPage: Restaurant[] | null): RestaurantsKey | null => {
    if (previousPage && previousPage.length < PAGE_SIZE) return null // reached the end
    return ['restaurants', cuisineKeys.join(','), seed, coordKey, pageIndex] as const
  }
}

export function useRestaurants(
  cuisineKeys: string[] = [],
  seed: string,
  coords: Coords | null = null,
) {
  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<Restaurant[]>(
    getKey(cuisineKeys, seed, coords),
    ([, keys, keySeed, coordKey, pageIndex]: RestaurantsKey) => {
      const parsedCoords: Coords | null = coordKey
        ? (() => {
            const [lat, lng] = coordKey.split(',').map(Number)
            return { lat, lng }
          })()
        : null
      return fetchRestaurantsPage(
        keys ? keys.split(',').filter(Boolean) : [],
        pageIndex * PAGE_SIZE,
        keySeed,
        parsedCoords,
      )
    },
  )

  // Flatten pages and dedupe by id — belt-and-suspenders against a row landing
  // on two pages if the underlying set changes mid-session (e.g. a fresh add).
  const restaurants = useMemo(() => {
    const flat = data?.flat() ?? []
    const seen = new Set<string>()
    return flat.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)))
  }, [data])
  const lastPage = data?.[data.length - 1]
  const isReachingEnd = lastPage !== undefined && lastPage.length < PAGE_SIZE

  function loadMore() {
    if (!isValidating && !isReachingEnd) setSize(size + 1)
  }

  return { restaurants, isLoading, isReachingEnd, loadMore }
}
