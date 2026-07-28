-- Enable PostGIS for location queries (bundled with Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Restaurants
CREATE TABLE restaurants (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id    TEXT UNIQUE NOT NULL,
  name               TEXT NOT NULL,

  -- Extracted columns for querying / filtering
  address            TEXT,
  lat                DOUBLE PRECISION,
  lng                DOUBLE PRECISION,
  price_level        SMALLINT CHECK (price_level BETWEEN 0 AND 4),
  rating             NUMERIC(2,1),
  total_ratings      INTEGER,
  phone              TEXT,
  website            TEXT,
  business_status    TEXT CHECK (business_status IN ('OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY')),
  tags               TEXT[],           -- full Places API 'types' array, archival
  primary_type       TEXT,             -- Places API 'primaryType' — cuisine filter matches on this
  google_maps_uri    TEXT,             -- for "View on Google Maps" link

  -- Image (stored in Supabase Storage after optimization)
  primary_image_path TEXT,             -- e.g. {place_id}/primary.webp
  image_blurhash     TEXT,             -- ~30-char placeholder hash
  image_width        SMALLINT,
  image_height       SMALLINT,

  -- Full Places API response — never call again
  raw_place_data     JSONB NOT NULL DEFAULT '{}',

  -- Provenance
  submitted_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_restaurants_primary_type ON restaurants (primary_type);
CREATE INDEX idx_restaurants_rating       ON restaurants (rating DESC NULLS LAST);
CREATE INDEX idx_restaurants_status       ON restaurants (business_status);
CREATE INDEX idx_restaurants_tags         ON restaurants USING gin (tags);
CREATE INDEX idx_restaurants_location     ON restaurants USING gist (ST_Point(lng, lat))
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
