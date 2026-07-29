'use client'

import { motion } from 'framer-motion'
import { SlidersHorizontal, Check } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { CUISINE_FILTERS } from '@/lib/domain/cuisine-mapping'
import { cn } from '@/lib/utils'

const CUISINE_EMOJI: Record<string, string> = {
  chinese: '🥟',
  dim_sum: '🥟',
  hot_pot: '🍲',
  japanese: '🍱',
  sushi: '🍣',
  ramen: '🍜',
  korean: '🥩',
  bbq: '🍖',
  thai: '🌶️',
  vietnamese: '🍜',
  western: '🍽️',
  steakhouse: '🥩',
  burgers: '🍔',
  italian: '🍝',
  pizza: '🍕',
  indian: '🍛',
  seafood: '🦐',
  dessert: '🍮',
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
            aria-label="開啟篩選"
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

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-3xl px-5 pb-8 pt-5 max-w-[430px] mx-auto left-0 right-0 overflow-y-auto max-h-[85vh]"
      >
        <SheetHeader className="p-0 mb-4">
          <SheetTitle className="font-heading text-xl">篩選菜式</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {CUISINE_FILTERS.map(({ key, label }, i) => {
            const active = activeFilters.includes(key)
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.26 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => onToggle(key)}
                aria-pressed={active}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl border-2 text-xs font-medium transition-colors duration-150 cursor-pointer',
                  active
                    ? 'bg-primary border-primary text-primary-foreground shadow-[0_8px_24px_rgba(255,107,43,0.35)]'
                    : 'bg-card border-border text-foreground shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
                )}
              >
                <span className="text-xl" aria-hidden>{CUISINE_EMOJI[key]}</span>
                {label}
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                    className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-foreground rounded-full flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-primary" strokeWidth={3} />
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="flex gap-3">
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={onClear} className="flex-1 rounded-xl h-12">
              清除全部
            </Button>
          )}
          <SheetClose
            render={
              <Button className="flex-1 rounded-xl h-12 bg-primary hover:bg-primary/90" />
            }
          >
            顯示結果
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
