'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Shuffle, Star, MapPin, Trophy, Trash2 } from 'lucide-react'
import type { Restaurant } from '@/lib/types'
import { SpinnerWheel, type SpinnerWheelHandle } from './SpinnerWheel'
import { Button } from '@/components/ui/button'
import { BlurhashImage } from '@/components/ui/blurhash-image'

const PRICE_SYMBOLS: Record<number, string> = { 0: '免費', 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

interface SelectionViewProps {
  selected: Restaurant[]
  onRemove: (id: string) => void
  onClear: () => void
  onBack: () => void
}

export function SelectionView({ selected, onRemove, onClear, onBack }: SelectionViewProps) {
  const wheelRef = useRef<SpinnerWheelHandle>(null)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const canSpin = selected.length >= 2
  const isSolo = selected.length === 1
  const winner = selected.find((r) => r.id === winnerId) ?? null

  function handleSpin() {
    if (!wheelRef.current || !canSpin || isSpinning) return
    setWinnerId(null)
    setIsSpinning(true)
    const { restaurant } = wheelRef.current.spin()
    setTimeout(() => {
      setWinnerId(restaurant.id)
      setIsSpinning(false)
    }, 4200)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-safe-top py-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={onBack}
          aria-label="返去滑動畫面"
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground leading-tight">我嘅心水</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selected.length === 0
              ? '未有心水'
              : isSolo
                ? '就係佢喇!'
                : winner
                  ? '轉盤揀咗佢!'
                  : '轉盤幫你揀'}
          </p>
        </div>
        {selected.length > 0 && !winner && !isSpinning && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={onClear}
            aria-label="清除全部心水"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground px-2.5 py-1.5 rounded-full hover:text-destructive cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清除
          </motion.button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 flex flex-col justify-center gap-5 py-6">
        {selected.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <div className="text-5xl">🍽️</div>
            <p className="text-sm text-muted-foreground max-w-[220px]">
              喺滑動畫面心水啲餐廳,就會出現喺呢度。
            </p>
          </div>
        )}

        {/* Picks list */}
        {selected.length > 0 && (
          <div className="flex flex-col gap-3">
            {selected.map((restaurant, i) => {
              const isWinner = winner?.id === restaurant.id
              return (
                <motion.div
                  key={restaurant.id}
                  layout
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 bg-card transition-all duration-500 ${
                    isWinner
                      ? 'border-primary shadow-[0_8px_28px_rgba(255,107,43,0.22)]'
                      : 'border-transparent shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  {/* Thumbnail + number badge */}
                  <div className="relative shrink-0">
                    <BlurhashImage
                      src={restaurant.imageUrl}
                      blurhash={restaurant.imageBlurhash}
                      alt={restaurant.name}
                      className="w-16 h-16 rounded-xl"
                    />
                    <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm leading-tight truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{restaurant.typeLabel}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {restaurant.rating !== null && (
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          <Star className="w-3 h-3 fill-primary stroke-primary" />
                          {restaurant.rating}
                        </span>
                      )}
                      {restaurant.priceLevel !== null && (
                        <span className="text-muted-foreground">{PRICE_SYMBOLS[restaurant.priceLevel]}</span>
                      )}
                    </div>
                  </div>

                  {/* Trailing: winner trophy or remove */}
                  {isWinner ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                      className="shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Trophy className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  ) : (
                    !winner &&
                    !isSpinning && (
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        onClick={() => onRemove(restaurant.id)}
                        aria-label={`移除 ${restaurant.name}`}
                        className="shrink-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )
                  )}
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Wheel (2+ picks only) */}
        {canSpin && (
          <div className="flex flex-col items-center gap-6 pt-1">
            <SpinnerWheel ref={wheelRef} restaurants={selected} />

            <Button
              onClick={handleSpin}
              disabled={isSpinning || !!winner}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold gap-2 disabled:opacity-50 active:scale-[0.97] transition-transform px-4"
            >
              {isSpinning ? (
                '轉緊…'
              ) : winner ? (
                <span className="truncate">🎉 {winner.name}</span>
              ) : (
                <>
                  <Shuffle className="w-5 h-5 shrink-0" />
                  轉盤!
                </>
              )}
            </Button>
          </div>
        )}

        {/* Solo shortcut — no wheel needed */}
        {isSolo && (
          <div className="pt-1">
            {selected[0].googleMapsUri ? (
              <Button
                render={
                  <a href={selected[0].googleMapsUri} target="_blank" rel="noopener noreferrer" />
                }
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-bold gap-2 active:scale-[0.97] transition-transform"
              >
                <MapPin className="w-5 h-5" />
                今晚就去食呢間!
              </Button>
            ) : (
              <div className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center gap-2">
                🎉 今晚就去食呢間!
              </div>
            )}
          </div>
        )}

        {/* Winner map link (2+ picks, after spin) */}
        {winner && winner.googleMapsUri && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              render={<a href={winner.googleMapsUri} target="_blank" rel="noopener noreferrer" />}
              variant="outline"
              className="w-full h-12 rounded-2xl gap-2"
            >
              <MapPin className="w-4 h-4" />
              喺地圖查看
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
