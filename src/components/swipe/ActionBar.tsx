'use client'

import { motion } from 'framer-motion'
import { Info, Navigation } from 'lucide-react'
import { MAX_SELECTION } from '@/hooks/useSelection'

interface ActionBarProps {
  selectionCount: number
  hasCard: boolean
  hasMap: boolean
  onOpenDetail: () => void
  onOpenMap: () => void
  onOpenSelection: () => void
}

export function ActionBar({
  selectionCount,
  hasCard,
  hasMap,
  onOpenDetail,
  onOpenMap,
  onOpenSelection,
}: ActionBarProps) {
  return (
    <div className="flex items-center justify-between px-8">
      {/* Details — current card */}
      <motion.button
        whileTap={hasCard ? { scale: 0.88 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        onClick={onOpenDetail}
        disabled={!hasCard}
        aria-label="餐廳詳情"
        className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center shadow-md cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-default"
      >
        <Info className="w-6 h-6 text-muted-foreground" />
      </motion.button>

      {/* Selection badge */}
      <motion.button
        whileTap={selectionCount > 0 ? { scale: 0.9 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        onClick={onOpenSelection}
        disabled={selectionCount === 0}
        aria-label={`查看已選 (${selectionCount} / ${MAX_SELECTION})`}
        className="flex flex-col items-center gap-1 cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-default"
      >
        <div className="relative w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
          <span className="text-primary-foreground font-bold text-lg leading-none">
            {selectionCount}
          </span>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground text-[9px] font-bold">{MAX_SELECTION}</span>
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">我嘅心水</span>
      </motion.button>

      {/* Map — current card */}
      <motion.button
        whileTap={hasMap ? { scale: 0.88 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        onClick={onOpenMap}
        disabled={!hasMap}
        aria-label="喺地圖查看"
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-default"
      >
        <Navigation className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
      </motion.button>
    </div>
  )
}
