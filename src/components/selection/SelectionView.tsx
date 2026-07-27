'use client'

import { useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shuffle } from 'lucide-react'
import type { Restaurant } from '@/lib/types'
import { MAX_SELECTION } from '@/hooks/useSelection'
import { SpinnerWheel, type SpinnerWheelHandle } from './SpinnerWheel'
import { ResultOverlay } from './ResultOverlay'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SelectionViewProps {
  selected: Restaurant[]
  onRemove: (id: string) => void
  onBack: () => void
}

export function SelectionView({ selected, onRemove, onBack }: SelectionViewProps) {
  const wheelRef = useRef<SpinnerWheelHandle>(null)
  const [result, setResult] = useState<Restaurant | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  function handleSpin() {
    if (!wheelRef.current || selected.length === 0 || isSpinning) return
    setIsSpinning(true)
    const winner = wheelRef.current.spin()
    setTimeout(() => {
      setResult(winner)
      setIsSpinning(false)
    }, 4200)
  }

  const emptySlots = Array.from({ length: Math.max(0, MAX_SELECTION - selected.length) })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          aria-label="Back to swipe"
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Your Picks</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-6 pb-4">
        {/* Selection slots */}
        <div className="flex gap-3">
          {selected.map((restaurant) => (
            <div key={restaurant.id} className="flex-1 relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-sm">
                <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => onRemove(restaurant.id)}
                aria-label={`Remove ${restaurant.name}`}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground flex items-center justify-center cursor-pointer"
              >
                <X className="w-3 h-3 text-background" />
              </button>
              <p className="mt-1.5 text-xs font-medium text-center text-foreground truncate px-1">
                {restaurant.name}
              </p>
            </div>
          ))}

          {emptySlots.map((_, i) => (
            <div key={`empty-${i}`} className="flex-1">
              <div className="aspect-square rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center">
                <span className="text-2xl text-muted-foreground">+</span>
              </div>
              <p className="mt-1.5 text-xs text-center text-muted-foreground">Empty</p>
            </div>
          ))}
        </div>

        {selected.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Like restaurants on the swipe screen to add them here.
          </p>
        )}

        {/* Spinner */}
        {selected.length > 0 && (
          <div className="flex flex-col items-center gap-6">
            <SpinnerWheel ref={wheelRef} restaurants={selected} />

            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full max-w-xs h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold gap-2 disabled:opacity-50"
            >
              <Shuffle className="w-5 h-5" />
              {isSpinning ? 'Spinning…' : 'Spin!'}
            </Button>
          </div>
        )}
      </div>

      {/* Result overlay */}
      <AnimatePresence>
        {result && (
          <ResultOverlay
            restaurant={result}
            onDismiss={() => setResult(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
