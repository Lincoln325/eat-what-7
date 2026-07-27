'use client'

import { useEffect } from 'react'
import { useFilter } from '@/hooks/useFilter'
import { useSwipeDeck } from '@/hooks/useSwipeDeck'
import { useSelection } from '@/hooks/useSelection'
import { SwipeDeck } from '@/components/swipe/SwipeDeck'
import { ActionBar } from '@/components/swipe/ActionBar'
import { FilterSheet } from '@/components/filter/FilterSheet'
import { SelectionView } from '@/components/selection/SelectionView'
import { MAX_SELECTION } from '@/hooks/useSelection'
import type { AppView } from '@/lib/types'
import { useState } from 'react'

export function AppShell() {
  const [view, setView] = useState<AppView>('swipe')
  const { activeFilters, filteredRestaurants, toggleFilter, clearFilters } = useFilter()
  const { currentCard, nextCard, isExhausted, advance, reset } = useSwipeDeck(filteredRestaurants)
  const { selected, addToSelection, removeFromSelection } = useSelection()

  // Reset deck when filters change
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters.join(',')])

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
      {view === 'swipe' ? (
        <>
          {/* Header */}
          <header className="flex items-center justify-between px-5 pt-safe-top py-4">
            <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">EatWhat</h1>
            <FilterSheet
              activeFilters={activeFilters}
              onToggle={toggleFilter}
              onClear={clearFilters}
            />
          </header>

          {/* Card deck — fills remaining space */}
          <div className="flex-1 px-4 py-2 relative min-h-0">
            <SwipeDeck
              currentCard={currentCard}
              nextCard={nextCard}
              isExhausted={isExhausted}
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
              onOpenSelection={() => setView('selection')}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col pt-safe-top">
          <SelectionView
            selected={selected}
            onRemove={removeFromSelection}
            onBack={() => setView('swipe')}
          />
        </div>
      )}
    </div>
  )
}
