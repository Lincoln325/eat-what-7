'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { Restaurant } from '@/lib/types'
import { SwipeCard } from './SwipeCard'
import { BlurhashImage } from '@/components/ui/blurhash-image'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface SwipeDeckProps {
  currentCard: Restaurant | null
  nextCard: Restaurant | null
  isExhausted: boolean
  isLoading: boolean
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onReset: () => void
}

function DeckSkeleton() {
  return (
    <div className="absolute inset-0 rounded-3xl bg-muted overflow-hidden animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
        <div className="h-7 w-2/3 rounded-lg bg-foreground/10" />
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-foreground/10" />
          <div className="h-6 w-12 rounded-full bg-foreground/10" />
        </div>
      </div>
    </div>
  )
}

export function SwipeDeck({
  currentCard,
  nextCard,
  isExhausted,
  isLoading,
  onSwipeLeft,
  onSwipeRight,
  onReset,
}: SwipeDeckProps) {
  if (isLoading && !currentCard) {
    return (
      <div className="relative h-full w-full">
        <DeckSkeleton />
      </div>
    )
  }

  if (isExhausted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
        <div className="text-6xl">🍽️</div>
        <h3 className="text-xl font-bold font-heading text-foreground">睇完晒喇！</h3>
        <p className="text-muted-foreground text-sm">試下轉篩選,或者重新開始睇多啲餐廳。</p>
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重新開始
        </Button>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {/* Background card (next) */}
      {nextCard && (
        <div className="absolute inset-0 scale-95 translate-y-4 rounded-3xl overflow-hidden shadow-md">
          <BlurhashImage
            src={nextCard.imageUrl}
            blurhash={nextCard.imageBlurhash}
            alt=""
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Top card — promotes from the background card's resting transform
          (scale .95, y+16) so it slides into place instead of fading in over
          its own duplicate in the background layer (which caused a flick). */}
      <AnimatePresence>
        {currentCard && (
          <motion.div
            key={currentCard.id}
            className="absolute inset-0"
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
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
