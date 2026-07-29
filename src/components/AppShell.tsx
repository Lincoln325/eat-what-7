'use client'

import { useEffect } from 'react'
import { useFilter } from '@/hooks/useFilter'
import { useRestaurants } from '@/hooks/useRestaurants'
import { useSwipeDeck } from '@/hooks/useSwipeDeck'
import { useSelection } from '@/hooks/useSelection'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeDeck } from '@/components/swipe/SwipeDeck'
import { ActionBar } from '@/components/swipe/ActionBar'
import { FilterSheet } from '@/components/filter/FilterSheet'
import { SelectionView } from '@/components/selection/SelectionView'
import { SwipeProgress } from '@/components/swipe/SwipeProgress'
import { MAX_SELECTION } from '@/hooks/useSelection'
import type { AppView } from '@/lib/types'
import { useState } from 'react'

const PAGE_VARIANTS = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 36 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -36 }),
}
const PAGE_TRANSITION = { duration: 0.26, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }

const PREFETCH_THRESHOLD = 5

export function AppShell() {
  const [view, setView] = useState<AppView>('swipe')
  const { activeFilters, toggleFilter, clearFilters } = useFilter()
  const { restaurants, isLoading, isReachingEnd, loadMore } = useRestaurants(activeFilters)
  const { currentCard, nextCard, isExhausted, remainingCount, advance, reset } = useSwipeDeck(restaurants)
  const { selected, addToSelection, removeFromSelection, clearSelection } = useSelection()

  // Reset deck when filters change
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters.join(',')])

  // Prefetch the next page before the deck actually runs dry
  useEffect(() => {
    if (!isReachingEnd && remainingCount <= PREFETCH_THRESHOLD) {
      loadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingCount, isReachingEnd])

  function handleSwipeLeft() {
    advance()
  }

  function handleSwipeRight() {
    if (currentCard && selected.length < MAX_SELECTION) {
      addToSelection(currentCard)
    }
    advance()
  }

  function handleLike() {
    handleSwipeRight()
  }

  function handleSkip() {
    handleSwipeLeft()
  }

  return (
    <div className="flex flex-col h-dvh max-w-[430px] mx-auto bg-background overflow-hidden">
      <AnimatePresence mode="wait" custom={view === 'swipe' ? -1 : 1} initial={false}>
        {view === 'swipe' ? (
          <motion.div
            key="swipe"
            custom={-1}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 pt-safe-top py-4">
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                食乜<span className="text-primary">7</span>
              </h1>
              <FilterSheet
                activeFilters={activeFilters}
                onToggle={toggleFilter}
                onClear={clearFilters}
              />
            </header>

            {/* Session goal — save 3, then decide */}
            <div className="px-5 pb-1">
              <SwipeProgress count={selected.length} total={MAX_SELECTION} />
            </div>

            {/* Card deck — fills remaining space */}
            <div className="flex-1 px-4 py-2 relative min-h-0">
              <SwipeDeck
                currentCard={currentCard}
                nextCard={nextCard}
                isExhausted={isExhausted && isReachingEnd}
                isLoading={isLoading}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onReset={reset}
              />
            </div>

            {/* Action bar */}
            <div className="py-6 pb-safe-bottom">
              <ActionBar
                selectionCount={selected.length}
                onSkip={handleSkip}
                onLike={handleLike}
                onOpenSelection={() => {
                  if (selected.length > 0) setView('selection')
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            custom={1}
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="flex-1 flex flex-col pt-safe-top min-h-0"
          >
            <SelectionView
              selected={selected}
              onRemove={removeFromSelection}
              onClear={() => {
                clearSelection()
                setView('swipe')
              }}
              onBack={() => setView('swipe')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
