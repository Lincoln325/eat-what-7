'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Star, MapPin, ArrowLeft, RefreshCw, Check, AlertCircle } from 'lucide-react'
import type { PlacePreview } from '@/lib/types'
import { previewRestaurant, confirmRestaurant } from '@/lib/api/restaurants-client'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { BlurhashImage } from '@/components/ui/blurhash-image'

const PRICE_SYMBOLS: Record<number, string> = { 0: '免費', 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

interface AddRestaurantSheetProps {
  onAdded: () => void
}

export function AddRestaurantSheet({ onAdded }: AddRestaurantSheetProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<PlacePreview | null>(null)
  const [payload, setPayload] = useState<unknown>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setUrl('')
    setPreview(null)
    setPayload(null)
    setIsPreviewing(false)
    setIsConfirming(false)
    setDone(false)
    setError(null)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setTimeout(reset, 200)
  }

  async function handlePreview() {
    const trimmed = url.trim()
    if (!trimmed || isPreviewing) return
    setIsPreviewing(true)
    setError(null)
    try {
      const res = await previewRestaurant(trimmed)
      setPreview(res.preview)
      setPayload(res.payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : '預覽失敗,請檢查連結。')
    } finally {
      setIsPreviewing(false)
    }
  }

  async function handleConfirm() {
    if (!payload || isConfirming) return
    setIsConfirming(true)
    setError(null)
    try {
      await confirmRestaurant(payload)
      setDone(true)
      onAdded()
      setTimeout(() => handleOpenChange(false), 900)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入失敗。')
      setIsConfirming(false)
    }
  }

  const step: 'url' | 'preview' = preview ? 'preview' : 'url'

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

        <div className="flex items-center gap-2 mb-4">
          {step === 'preview' && !done && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setPreview(null)
                setPayload(null)
                setError(null)
              }}
              aria-label="返回上一步"
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          )}
          <SheetTitle className="font-heading text-xl">
            {step === 'url' ? '新增餐廳' : '確認資料'}
          </SheetTitle>
        </div>

        <AnimatePresence mode="wait">
          {step === 'url' ? (
            <motion.div
              key="url"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <label htmlFor="maps-url" className="text-sm text-muted-foreground">
                貼上 Google Maps 餐廳連結
              </label>
              <input
                id="maps-url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
                placeholder="https://maps.app.goo.gl/…"
                className="h-12 rounded-xl border border-border bg-background px-4 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {error && (
                <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}
              <Button
                onClick={handlePreview}
                disabled={!url.trim() || isPreviewing}
                className="h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2 mt-1"
              >
                {isPreviewing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    載入緊…
                  </>
                ) : (
                  '預覽'
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {preview && (
                <>
                  <BlurhashImage
                    src={preview.imageUrl}
                    blurhash={null}
                    alt={preview.name}
                    className="w-full aspect-[16/10] rounded-2xl"
                  />
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-lg text-foreground leading-tight">
                        {preview.name}
                      </h3>
                      {preview.priceLevel !== null && (
                        <span className="shrink-0 text-sm font-semibold text-muted-foreground mt-1">
                          {PRICE_SYMBOLS[preview.priceLevel]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{preview.typeLabel}</span>
                      {preview.rating !== null && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1 font-semibold text-foreground">
                            <Star className="w-3.5 h-3.5 fill-primary stroke-primary" />
                            {preview.rating}
                          </span>
                          {preview.ratingCount !== null && <span>({preview.ratingCount})</span>}
                        </>
                      )}
                    </div>
                  </div>

                  {preview.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {preview.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {preview.address && (
                    <div className="flex items-start gap-2.5 text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{preview.address}</span>
                    </div>
                  )}

                  {preview.alreadyExists ? (
                    <div className="flex items-center gap-2 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      呢間已經喺資料庫喇。
                    </div>
                  ) : (
                    <>
                      {error && (
                        <p role="alert" className="flex items-center gap-1.5 text-xs text-destructive">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {error}
                        </p>
                      )}
                      <Button
                        onClick={handleConfirm}
                        disabled={isConfirming || done}
                        className="h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2"
                      >
                        {done ? (
                          <>
                            <Check className="w-4 h-4" />
                            已加入!
                          </>
                        ) : isConfirming ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            加入緊…
                          </>
                        ) : (
                          '加入資料庫'
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
