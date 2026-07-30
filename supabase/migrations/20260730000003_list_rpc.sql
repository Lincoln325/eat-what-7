-- Seeded shuffle + optional proximity weighting for the swipe deck.
--
-- Why an RPC: the Supabase JS client can't ORDER BY an expression, and we need
-- a per-session-stable pseudo-random order (so offset pagination never dups or
-- skips a row mid-session) that also optionally biases toward the user's
-- location without becoming a boring deterministic "nearest first" list.
--
-- Sort key per row:
--   loc off:  rnd                                   (pure seeded shuffle)
--   loc on:   w * dist/(dist+1000)  +  (1-w) * rnd  (proximity-weighted shuffle)
-- where
--   rnd  = hash(id || seed) normalized to [0,1)  -- stable given the session seed
--   dist = metres from the user (PostGIS geography), NULL coords ranked last
-- Ascending: smaller key = closer / earlier. w ~= 0.7 keeps nearby on top while
-- the random term still shuffles, so the same area feels fresh each session.
CREATE OR REPLACE FUNCTION list_restaurants(
  cuisine_types text[]          DEFAULT NULL,   -- flattened Google types, NULL = no filter
  seed          text            DEFAULT '',     -- per-session shuffle seed
  user_lat      double precision DEFAULT NULL,  -- NULL = location sort off
  user_lng      double precision DEFAULT NULL,
  loc_weight    double precision DEFAULT 0.7,   -- 0 = pure random, 1 = pure nearest
  result_offset int             DEFAULT 0,
  result_limit  int             DEFAULT 20
)
RETURNS TABLE (
  id                            uuid,
  name                          text,
  name_zh                       text,
  primary_type                  text,
  primary_type_display_name_zh  text,
  tags                          text[],
  rating                        numeric,
  price_level                   smallint,
  primary_image_path            text,
  image_blurhash                text,
  google_maps_uri               text,
  region                        text
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    q.id, q.name, q.name_zh, q.primary_type, q.primary_type_display_name_zh,
    q.tags, q.rating, q.price_level, q.primary_image_path, q.image_blurhash,
    q.google_maps_uri, q.region
  FROM (
    SELECT
      r.*,
      -- hash(id||seed) -> [0,1): stable per session so pages stay consistent
      (('x' || substr(md5(r.id::text || seed), 1, 16))::bit(64)::bigint::double precision
        / 9223372036854775807.0 + 1.0) / 2.0 AS rnd,
      CASE
        WHEN user_lat IS NULL OR user_lng IS NULL THEN NULL
        ELSE ST_Distance(
               ST_Point(r.lng, r.lat)::geography,
               ST_Point(user_lng, user_lat)::geography)
      END AS dist
    FROM restaurants r
    WHERE r.business_status IS DISTINCT FROM 'CLOSED_PERMANENTLY'
      AND (
        cuisine_types IS NULL
        OR r.primary_type = ANY(cuisine_types)
        OR r.tags && cuisine_types
      )
  ) q
  ORDER BY
    CASE
      WHEN user_lat IS NULL OR user_lng IS NULL THEN q.rnd
      ELSE loc_weight * (COALESCE(q.dist, 1e9) / (COALESCE(q.dist, 1e9) + 1000.0))
           + (1.0 - loc_weight) * q.rnd
    END
  OFFSET result_offset
  LIMIT result_limit;
$$;

-- Public read, same as the table's RLS SELECT policy (function is SECURITY
-- INVOKER, so the underlying RLS still applies to anon/authenticated callers).
GRANT EXECUTE ON FUNCTION list_restaurants(
  text[], text, double precision, double precision, double precision, int, int
) TO anon, authenticated;
