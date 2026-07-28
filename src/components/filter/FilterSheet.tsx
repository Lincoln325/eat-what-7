'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { CUISINE_FILTERS } from '@/lib/domain/cuisine-mapping'
import { cn } from '@/lib/utils'

const CUISINE_EMOJI: Record<string, string> = {
  chinese: '🥟',
  japanese: '🍣',
  korean: '🥩',
  western: '🍔',
  thai: '🌶️',
  italian: '🍕',
  indian: '🍛',
}

interface FilterSheetProps {
  activeFilters: string[]
  onToggle: (key: string) => void
  onClear: () => void
}

export function FilterSheet({ activeFilters, onToggle, onClear }: FilterSheetProps) {
  return (
    <Sheet>
      {/* Use render prop (Base UI pattern) to avoid nested <button> */}
      <SheetTrigger
        render={
          <button
            aria-label="Open filters"
            className="relative w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
          />
        }
      >
        <SlidersHorizontal className="w-4 h-4 text-foreground" />
        {activeFilters.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            {activeFilters.length}
          </span>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-3xl pb-10 max-w-[430px] mx-auto left-0 right-0">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-heading text-xl">Filter by Cuisine</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {CUISINE_FILTERS.map(({ key, label }) => {
            const active = activeFilters.includes(key)
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                aria-pressed={active}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all active:scale-95 cursor-pointer',
                  active
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-card border-border text-foreground',
                )}
              >
                <span className="text-lg" aria-hidden>{CUISINE_EMOJI[key]}</span>
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex gap-3">
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={onClear} className="flex-1 rounded-2xl h-12">
              Clear All
            </Button>
          )}
          <SheetClose
            render={
              <Button className="flex-1 rounded-2xl h-12 bg-primary hover:bg-primary/90" />
            }
          >
            Show Results
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
