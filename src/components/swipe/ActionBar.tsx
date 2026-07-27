'use client'

import { X, Heart } from 'lucide-react'
import { MAX_SELECTION } from '@/hooks/useSelection'

interface ActionBarProps {
  selectionCount: number
  onSkip: () => void
  onLike: () => void
  onOpenSelection: () => void
}

export function ActionBar({ selectionCount, onSkip, onLike, onOpenSelection }: ActionBarProps) {
  return (
    <div className="flex items-center justify-between px-8">
      {/* Skip */}
      <button
        onClick={onSkip}
        aria-label="Skip restaurant"
        className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
      >
        <X className="w-6 h-6 text-muted-foreground" />
      </button>

      {/* Selection badge */}
      <button
        onClick={onOpenSelection}
        aria-label={`View selection (${selectionCount} of ${MAX_SELECTION})`}
        className="flex flex-col items-center gap-1 cursor-pointer"
      >
        <div className="relative w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md active:scale-95 transition-transform">
          <span className="text-primary-foreground font-bold text-lg leading-none">
            {selectionCount}
          </span>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground text-[9px] font-bold">{MAX_SELECTION}</span>
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">My Picks</span>
      </button>

      {/* Like */}
      <button
        onClick={onLike}
        aria-label="Like restaurant"
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
      >
        <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
      </button>
    </div>
  )
}
