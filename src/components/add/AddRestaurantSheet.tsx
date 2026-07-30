'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MapPin, RefreshCw, Check, AlertCircle } from 'lucide-react'
import type { PlaceSearchResult } from '@/lib/types'
import { searchPlaces, addRestaurants } from '@/lib/api/restaurants-client'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { BlurhashImage } from '@/components/ui/blurhash-image'
import { cn } from '@/lib/utils'

interface AddRestaurantSheetProps {
  onAdded: () => void
}

export function AddRestaurantSheet({ onAdded }: AddRestaurantSheetProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addedCount, setAddedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setQuery('')
    setResults(null)
    setSelected(new Set())
    setIsSearching(false)
    setIsAdding(false)
    setAddedCount(0)
    setError(null)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  async function handleSearch() {
    const trimmed = query.trim()
    if (!trimmed || isSearching) return
    setIsSearching(true)
    setError(null)
    setResults(null)
    setSelected(new Set())
    try {
      const res = await searchPlaces(trimmed)
      setResults(res)
      if (res.length === 0) setError('搵唔到餐廳,試下換個名或者貼上連結。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜尋失敗,請再試。')
    } finally {
      setIsSearching(false)
    }
  }

  function toggle(placeId: string, disabled: boolean) {
    if (disabled) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(placeId)) next.delete(placeId)
      else next.add(placeId)
      return next
    })
  }

  async function handleAdd() {
    if (selected.size === 0 || isAdding) return
    setIsAdding(true)
    setError(null)
    try {
      const res = await addRestaurants([...selected])
      onAdded()
      if (res.failed > 0) {
        setError(`加咗 ${res.added} 間,${res.failed} 間失敗。`)
        setIsAdding(false)
        // Drop the successful ones from selection so retry only re-adds fails.
        const failedIds = new Set(res.results.filter((r) => !r.ok).map((r) => r.placeId))
        setSelected(failedIds)
      } else {
        setAddedCount(res.added)
        setTimeout(() => handleOpenChange(false), 900)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入失敗。')
      setIsAdding(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <button
            aria-label="新增餐廳"
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
          />
        }
      >
        <Plus className="w-4 h-4 text-foreground" />
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-3xl px-5 pb-8 pt-3 max-w-[430px] mx-auto left-0 right-0 overflow-y-auto max-h-[88vh] gap-0"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" aria-hidden />

        <SheetTitle className="font-heading text-xl mb-4">新增餐廳</SheetTitle>

        {/* Search input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="place-query" className="text-sm text-muted-foreground">
            輸入餐廳名或貼上 Google Maps 連結
          </label>
          <div className="flex gap-2">
            <input
              id="place-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="例如:添好運 或 maps.app.goo.gl/…"
              className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              aria-label="搜尋"
              className="h-12 w-12 shrink-0 rounded-xl bg-primary hover:bg-primary/90 p-0"
            >
              {isSearching ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>
          {error && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Results list */}
        <AnimatePresence mode="wait">
          {results && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 flex flex-col gap-2"
            >
              {results.map((r) => {
                const isSelected = selected.has(r.placeId)
                return (
                  <button
                    key={r.placeId}
                    onClick={() => toggle(r.placeId, r.alreadyExists)}
                    disabled={r.alreadyExists}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors',
                      r.alreadyExists
                        ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                        : 'cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : !r.alreadyExists && 'border-border hover:bg-muted/50',
                    )}
                  >
                    <BlurhashImage
                      src={r.imageUrl}
                      blurhash={null}
                      alt={r.name}
                      className="w-16 h-16 rounded-xl shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground leading-tight truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.typeLabel}</p>
                      {r.address && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{r.address}</span>
                        </p>
                      )}
                    </div>
                    {/* Selection indicator */}
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full border flex items-center justify-center shrink-0',
                        r.alreadyExists
                          ? 'border-transparent bg-muted text-muted-foreground'
                          : isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border',
                      )}
                    >
                      {(isSelected || r.alreadyExists) && <Check className="w-4 h-4" />}
                    </span>
                  </button>
                )
              })}

              <Button
                onClick={handleAdd}
                disabled={selected.size === 0 || isAdding || addedCount > 0}
                className="h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2 mt-2"
              >
                {addedCount > 0 ? (
                  <>
                    <Check className="w-4 h-4" />
                    已加入 {addedCount} 間!
                  </>
                ) : isAdding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    加入緊…
                  </>
                ) : selected.size > 0 ? (
                  `加入 ${selected.size} 間餐廳`
                ) : (
                  '揀啲餐廳加入'
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
