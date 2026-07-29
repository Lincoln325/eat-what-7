'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { Restaurant } from '@/lib/types'
import { Star } from 'lucide-react'
import { BlurhashImage } from '@/components/ui/blurhash-image'

const PRICE_SYMBOLS: Record<number, string> = { 0: '免費', 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }
const SWIPE_THRESHOLD = 100

interface SwipeCardProps {
  restaurant: Restaurant
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
}

export function SwipeCard({ restaurant, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const likeOpacity = useTransform(x, [20, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0])

  const isDragging = useRef(false)

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    isDragging.current = false
    const offset = info.offset.x
    if (offset > SWIPE_THRESHOLD) {
      animate(x, 600, { duration: 0.3 }).then(onSwipeRight)
    } else if (offset < -SWIPE_THRESHOLD) {
      animate(x, -600, { duration: 0.3 }).then(onSwipeLeft)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 })
    }
  }

  return (
    <motion.div
      style={{ x, rotate, touchAction: 'none' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => { isDragging.current = true }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Card */}
      <div className="relative h-full w-full rounded-3xl overflow-hidden shadow-xl bg-card">
        {/* Hero image */}
        <div className="absolute inset-0">
          <BlurhashImage
            src={restaurant.imageUrl}
            blurhash={restaurant.imageBlurhash}
            alt={restaurant.name}
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>

        {/* LIKE overlay */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-10 left-6 border-4 border-green-400 rounded-xl px-4 py-2 rotate-[-15deg]"
        >
          <span className="text-green-400 font-bold text-3xl font-heading tracking-widest">LIKE</span>
        </motion.div>

        {/* NOPE overlay */}
        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-10 right-6 border-4 border-red-500 rounded-xl px-4 py-2 rotate-[15deg]"
        >
          <span className="text-red-500 font-bold text-3xl font-heading tracking-widest">NOPE</span>
        </motion.div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between gap-2 mb-2">
            <h2 className="text-2xl font-bold font-heading leading-tight">{restaurant.name}</h2>
            {restaurant.priceLevel !== null && (
              <span className="text-sm font-medium opacity-80 shrink-0">
                {PRICE_SYMBOLS[restaurant.priceLevel]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-3 text-sm">
            <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">{restaurant.typeLabel}</span>
            {restaurant.rating !== null && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-yellow-400" />
                {restaurant.rating}
              </span>
            )}
          </div>

          {restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {restaurant.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
