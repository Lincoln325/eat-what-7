import sharp from 'sharp'
import { encode } from 'blurhash'

const MAX_WIDTH = 900
const MAX_HEIGHT = 1200
const WEBP_QUALITY = 80
const BLURHASH_SIZE = 32

export interface ProcessedImage {
  buffer: Buffer
  blurhash: string
  width: number
  height: number
}

export async function processImage(sourceUrl: string): Promise<ProcessedImage> {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const input = Buffer.from(await res.arrayBuffer())

  const { data: webpData, info } = await sharp(input)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true })

  const { data: rawPixels, info: rawInfo } = await sharp(input)
    .resize(BLURHASH_SIZE, BLURHASH_SIZE, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const blurhash = encode(
    new Uint8ClampedArray(rawPixels),
    rawInfo.width,
    rawInfo.height,
    4,
    3,
  )

  return { buffer: webpData, blurhash, width: info.width, height: info.height }
}
