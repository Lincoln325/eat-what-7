'use client'

import { useEffect, useRef, useState } from 'react'
import { decode } from 'blurhash'
import { cn } from '@/lib/utils'

interface BlurhashImageProps {
  src: string | null
  blurhash: string | null
  alt: string
  className?: string
}

// Shows a decoded blurhash placeholder while the real image loads, then
// crossfades to the actual photo. Falls back to a plain muted box if
// neither src nor blurhash is available.
export function BlurhashImage({ src, blurhash, alt, className }: BlurhashImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!blurhash || !canvasRef.current) return
    try {
      const pixels = decode(blurhash, 32, 32)
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return
      const imageData = ctx.createImageData(32, 32)
      imageData.data.set(pixels)
      ctx.putImageData(imageData, 0, 0)
    } catch {
      // Malformed blurhash — just show the muted background instead
    }
  }, [blurhash])

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {blurhash && (
        <canvas
          ref={canvasRef}
          width={32}
          height={32}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-0' : 'opacity-100',
          )}
          aria-hidden
        />
      )}
      {src && (
        <img
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
