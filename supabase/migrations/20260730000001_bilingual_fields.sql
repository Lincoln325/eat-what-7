-- Bilingual support: keep English name (already in `name`), add Chinese name
-- and a Chinese display label for the primary type (sourced from Google's
-- own translation, avoids hand-maintaining a type->Chinese mapping).
ALTER TABLE restaurants
  ADD COLUMN name_zh TEXT,
  ADD COLUMN primary_type_display_name_zh TEXT;

COMMENT ON COLUMN restaurants.name IS 'English name (from Places API, languageCode=en)';
COMMENT ON COLUMN restaurants.name_zh IS 'Traditional Chinese name (from Places API, languageCode=zh-HK)';
COMMENT ON COLUMN restaurants.raw_place_data IS 'Shape: {"en": PlaceDetails, "zh_hk": PlaceDetails} — full API responses for both languages';
