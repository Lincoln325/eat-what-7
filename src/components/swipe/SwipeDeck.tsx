'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { Restaurant } from '@/lib/types'
import { SwipeCard } from './SwipeCard'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface SwipeDeckProps {
  currentCard: Restaurant | null
  nextCard: Restaurant | null
  isExhausted: boolean
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onReset: () => void
}

export function SwipeDeck({
  currentCard,
  nextCard,
  isExhausted,
  onSwipeLeft,
  onSwipeRight,
  onReset,
}: SwipeDeckProps) {
  if (isExhausted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
        <div className="text-6xl">🍽️</div>
        <h3 className="text-xl font-bold font-heading text-foreground">You've seen them all!</h3>
        <p className="text-muted-foreground text-sm">Change your filters or start over to see more restaurants.</p>
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Start Over
        </Button>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Background card (next) */}
      {nextCard && (
        <div className="absolute inset-0 scale-95 translate-y-4 rounded-3xl overflow-hidden shadow-md">
          <img
            src={nextCard.imageUrl}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Top card */}
      <AnimatePresence>
        {currentCard && (
          <motion.div
            key={currentCard.id}
            className="absolute inset-0"
            initial={{ scale: 0.98, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <SwipeCard
              restaurant={currentCard}
              onSwipeLeft={onSwipeLeft}
              onSwipeRight={onSwipeRight}
              isTop
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
