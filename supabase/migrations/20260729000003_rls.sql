-- Row Level Security for restaurants table
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Anyone can read active restaurants
CREATE POLICY "Public read restaurants"
  ON restaurants FOR SELECT
  USING (business_status IS DISTINCT FROM 'CLOSED_PERMANENTLY');

-- Authenticated users can insert
CREATE POLICY "Authenticated insert restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only the submitter can update their own submission
CREATE POLICY "Submitter can update"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (submitted_by = auth.uid());
