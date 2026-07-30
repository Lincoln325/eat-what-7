'use client'

import { useState, useCallback } from 'react'
import type { Coords } from '@/lib/api/restaurants-client'

type Status = 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable'

// Location-based sort toggle. Off by default; turning it on requests the
// browser geolocation permission. We keep the last fix in state and expose a
// simple on/off the deck can key its query on.
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  const enable = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
      },
      () => {
        setCoords(null)
        setStatus('denied')
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    )
  }, [])

  const disable = useCallback(() => {
    setCoords(null)
    setStatus('idle')
  }, [])

  const isOn = status === 'granted' && coords !== null

  return { coords: isOn ? coords : null, status, isOn, enable, disable }
}
