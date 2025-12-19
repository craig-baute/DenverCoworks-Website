
-- Create expert_finder_submissions table
CREATE TABLE IF NOT EXISTS expert_finder_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  building_size text NOT NULL,
  building_type text NOT NULL,
  goal text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE expert_finder_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can insert submissions"
  ON expert_finder_submissions FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admins) can view
CREATE POLICY "Admins can view submissions"
  ON expert_finder_submissions FOR SELECT
  TO authenticated
  USING (true);
