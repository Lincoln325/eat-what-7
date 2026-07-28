'use client'

import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import type { Restaurant } from '@/lib/types'
import { fetchRestaurantsPage, PAGE_SIZE } from '@/lib/api/restaurants-client'

type RestaurantsKey = readonly [string, string, number]

function getKey(cuisineKeys: string[]) {
  return (pageIndex: number, previousPage: Restaurant[] | null): RestaurantsKey | null => {
    if (previousPage && previousPage.length < PAGE_SIZE) return null // reached the end
    return ['restaurants', cuisineKeys.join(','), pageIndex] as const
  }
}

export function useRestaurants(cuisineKeys: string[] = []) {
  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<Restaurant[]>(
    getKey(cuisineKeys),
    ([, keys, pageIndex]: RestaurantsKey) =>
      fetchRestaurantsPage(keys ? keys.split(',').filter(Boolean) : [], pageIndex * PAGE_SIZE),
  )

  const restaurants = useMemo(() => data?.flat() ?? [], [data])
  const lastPage = data?.[data.length - 1]
  const isReachingEnd = lastPage !== undefined && lastPage.length < PAGE_SIZE

  function loadMore() {
    if (!isValidating && !isReachingEnd) setSize(size + 1)
  }

  return { restaurants, isLoading, isReachingEnd, loadMore }
}
