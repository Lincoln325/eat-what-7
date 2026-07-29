'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface SwipeProgressProps {
  count: number
  total: number
}

export function SwipeProgress({ count, total }: SwipeProgressProps) {
  const isFull = count >= total

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {isFull ? '夠喇!撳心水轉盤揀' : '心水 3 間就可以轉盤決定'}
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-primary">
          <Heart className="w-3 h-3 fill-primary" />
          {count}/{total}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ scaleX: i < count ? 1 : 0 }}
              style={{ transformOrigin: 'left' }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
