'use client'

import { motion } from 'framer-motion'
import type { Restaurant } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Star, MapPin, RotateCcw } from 'lucide-react'

const PRICE_SYMBOLS: Record<number, string> = { 0: 'Free', 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

interface ResultOverlayProps {
  restaurant: Restaurant
  onDismiss: () => void
}

export function ResultOverlay({ restaurant, onDismiss }: ResultOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px] bg-card rounded-t-3xl overflow-hidden pb-safe"
      >
        {/* Restaurant image */}
        <div className="relative h-56 bg-muted">
          {restaurant.imageUrl && (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1">
            <span className="text-4xl">🎉</span>
            <p className="text-white/80 text-sm font-medium">Tonight you're eating at</p>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <h2 className="text-2xl font-bold font-heading text-foreground mb-1">{restaurant.name}</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="bg-muted rounded-full px-3 py-1">{restaurant.cuisineLabel}</span>
            {restaurant.rating !== null && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-500 stroke-yellow-500" />
                {restaurant.rating}
              </span>
            )}
            {restaurant.priceLevel !== null && (
              <span>{PRICE_SYMBOLS[restaurant.priceLevel]}</span>
            )}
          </div>

          <div className="flex gap-3">
            {restaurant.googleMapsUri && (
              <Button
                render={<a href={restaurant.googleMapsUri} target="_blank" rel="noopener noreferrer" />}
                variant="outline"
                className="flex-1 rounded-2xl h-12 gap-2"
              >
                <MapPin className="w-4 h-4" />
                View on Maps
              </Button>
            )}
            <Button
              onClick={onDismiss}
              variant="outline"
              className="flex-1 rounded-2xl h-12 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Spin Again
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
