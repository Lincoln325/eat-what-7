import { translateTags } from '@/lib/domain/tag-labels'

// A single hit from Places Text Search (Pro tier). Only the fields we render
// in the pick-list — rating/price are Enterprise-tier and fetched later when
// the user actually adds the place.
export interface SearchPlace {
  id: string
  displayName?: { text: string; languageCode?: string }
  formattedAddress?: string
  shortFormattedAddress?: string
  primaryTypeDisplayName?: { text: string; languageCode?: string }
  types?: string[]
  photos?: Array<{ name: string; widthPx?: number; heightPx?: number }>
}

// What the client renders as a selectable card. imageUrl / alreadyExists are
// filled in by the service (photo redirect + DB lookup); the pure mapper
// leaves them at their defaults.
export interface PlaceSearchResultBase {
  placeId: string
  name: string
  typeLabel: string
  address: string | null
  tags: string[]
  photoName: string | null
}

export function mapToSearchResult(place: SearchPlace): PlaceSearchResultBase {
  return {
    placeId: place.id,
    name: place.displayName?.text ?? '未命名',
    typeLabel: place.primaryTypeDisplayName?.text ?? '餐廳',
    address: place.shortFormattedAddress ?? place.formattedAddress ?? null,
    tags: translateTags(place.types ?? []),
    photoName: place.photos?.[0]?.name ?? null,
  }
}
