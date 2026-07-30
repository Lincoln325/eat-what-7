-- Short human region label for the swipe card (e.g. 中環, 銅鑼灣, 九龍城).
-- Derived from raw_place_data.addressComponents at ingest so the lean list
-- query can return it without fetching the large raw_place_data blob.
ALTER TABLE restaurants
  ADD COLUMN region TEXT;

COMMENT ON COLUMN restaurants.region IS 'Short district/area label (neighborhood, falling back to administrative_area_level_1), preferring the zh-HK translation. Source: raw_place_data.addressComponents.';
