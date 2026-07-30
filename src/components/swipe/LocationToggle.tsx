'use client'

import { MapPin, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationToggleProps {
  isOn: boolean
  isLocating: boolean
  onToggle: () => void
}

// Third top-right control: weight the deck toward nearby restaurants. On tap
// (when off) it requests geolocation; while locating it shows a spinner. Styled
// to match the filter/add triggers, with the active state using the primary
// colour so it reads as "on".
export function LocationToggle({ isOn, isLocating, onToggle }: LocationToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOn ? '關閉附近優先' : '開啟附近優先'}
      aria-pressed={isOn}
      className={cn(
        'relative w-10 h-10 rounded-full border flex items-center justify-center shadow-sm active:scale-95 transition-[transform,background-color,border-color] cursor-pointer',
        isOn
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-card border-border text-foreground',
      )}
    >
      {isLocating ? (
        <LoaderCircle className="w-4 h-4 animate-spin" />
      ) : (
        <MapPin className="w-4 h-4" />
      )}
    </button>
  )
}
