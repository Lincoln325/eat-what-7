'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import useSWR from 'swr'
import {
  Star,
  Navigation,
  RefreshCw,
  Trash2,
  MapPin,
  Phone,
  Globe,
  Clock,
} from 'lucide-react'
import type { RestaurantDetail } from '@/lib/types'
import {
  fetchRestaurantDetail,
  refreshRestaurant,
  deleteRestaurant,
} from '@/lib/api/restaurants-client'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { BlurhashImage } from '@/components/ui/blurhash-image'

const PRICE_SYMBOLS: Record<number, string> = { 0: '免費', 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' }

interface RestaurantDetailSheetProps {
  restaurantId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (id: string) => void
}

function formatUpdatedAt(iso: string | null): string | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (Number.isNaN(days)) return null
  if (days <= 0) return '今日更新'
  if (days === 1) return '尋日更新'
  if (days < 30) return `${days} 日前更新`
  return `${Math.floor(days / 30)} 個月前更新`
}

export function RestaurantDetailSheet({
  restaurantId,
  open,
  onOpenChange,
  onDeleted,
}: RestaurantDetailSheetProps) {
  const { data, error, isLoading, mutate } = useSWR<RestaurantDetail>(
    open && restaurantId ? ['restaurant-detail', restaurantId] : null,
    () => fetchRestaurantDetail(restaurantId!),
  )

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showHours, setShowHours] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Reset transient UI when switching restaurants — adjust during render
  // rather than in an effect (React's recommended pattern).
  const [lastId, setLastId] = useState(restaurantId)
  if (restaurantId !== lastId) {
    setLastId(restaurantId)
    setShowHours(false)
    setActionError(null)
  }

  async function handleRefresh() {
    if (!restaurantId || isRefreshing) return
    setIsRefreshing(true)
    setActionError(null)
    try {
      await refreshRestaurant(restaurantId)
      await mutate()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '更新失敗')
    } finally {
      setIsRefreshing(false)
    }
  }

  async function handleDelete() {
    if (!restaurantId || isDeleting) return
    setIsDeleting(true)
    setActionError(null)
    try {
      await deleteRestaurant(restaurantId)
      onDeleted(restaurantId)
      onOpenChange(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '刪除失敗')
      setIsDeleting(false)
    }
  }

  const updatedLabel = data ? formatUpdatedAt(data.updatedAt) : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-3xl px-5 pb-8 pt-3 max-w-[430px] mx-auto left-0 right-0 overflow-y-auto max-h-[88vh] gap-0"
      >
        {/* Grab handle */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" aria-hidden />

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        )}

        {error && !isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            載入失敗,請再試。
          </div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
            className="flex flex-col gap-4"
          >
            {/* Hero */}
            <BlurhashImage
              src={data.imageUrl}
              blurhash={data.imageBlurhash}
              alt={data.name}
              className="w-full aspect-[16/10] rounded-2xl"
            />

            {/* Name + meta */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <SheetTitle className="font-heading text-xl leading-tight">{data.name}</SheetTitle>
                {data.priceLevel !== null && (
                  <span className="shrink-0 text-sm font-semibold text-muted-foreground mt-1">
                    {PRICE_SYMBOLS[data.priceLevel]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>{data.typeLabel}</span>
                {data.rating !== null && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Star className="w-3.5 h-3.5 fill-primary stroke-primary" />
                      {data.rating}
                    </span>
                    {data.ratingCount !== null && <span>({data.ratingCount})</span>}
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Info rows */}
            <div className="flex flex-col gap-2.5 text-sm">
              {data.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{data.address}</span>
                </div>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`} className="flex items-center gap-2.5 text-foreground">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  {data.phone}
                </a>
              )}
              {data.website && (
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-primary truncate"
                >
                  <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{data.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {data.openingHours.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowHours((v) => !v)}
                    className="flex items-center gap-2.5 text-foreground cursor-pointer"
                    aria-expanded={showHours}
                  >
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{showHours ? '收起營業時間' : '營業時間'}</span>
                  </button>
                  {showHours && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 ml-[26px] flex flex-col gap-1 text-xs text-muted-foreground overflow-hidden"
                    >
                      {data.openingHours.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              )}
            </div>

            {updatedLabel && (
              <p className="text-xs text-muted-foreground">{updatedLabel}</p>
            )}

            {actionError && (
              <p role="alert" className="text-xs text-destructive">{actionError}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex gap-2.5">
                {data.googleMapsUri && (
                  <a
                    href={data.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants(),
                      'flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 gap-2',
                    )}
                  >
                    <Navigation className="w-4 h-4 fill-primary-foreground" />
                    地圖查看
                  </a>
                )}
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex-1 h-12 rounded-xl gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? '更新緊…' : '更新資料'}
                </Button>
              </div>

              <AlertDialog>
                <AlertDialogTrigger
                  disabled={isDeleting}
                  className={cn(buttonVariants({ variant: 'destructive' }), 'w-full h-12 rounded-xl gap-2')}
                >
                  <Trash2 className="w-4 h-4" />
                  刪除餐廳
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>確定刪除?</AlertDialogTitle>
                  <AlertDialogDescription>
                    「{data.name}」會喺資料庫永久移除,呢個動作無得復原。
                  </AlertDialogDescription>
                  <div className="flex gap-2.5 mt-2">
                    <AlertDialogClose
                      className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-11 rounded-xl')}
                    >
                      取消
                    </AlertDialogClose>
                    <Button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 h-11 rounded-xl bg-destructive text-white hover:bg-destructive/90"
                    >
                      {isDeleting ? '刪除緊…' : '確定刪除'}
                    </Button>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  )
}
