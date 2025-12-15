/*
  # Add Neighborhoods table and Address fields
  
  1. New Tables
     - `neighborhoods`
       - `id` (uuid, primary key)
       - `name` (text, unique)
       - `created_at` (timestamp)
  
  2. Changes to `spaces`
     - Add `address_street` (text)
     - Add `address_city` (text)
     - Add `address_state` (text)
     - Add `address_zip` (text)
     - Add `address_lat` (float, optional for future maps)
     - Add `address_lng` (float, optional for future maps)

  3. Data
     - Seed `neighborhoods` with existing distinct values.
*/

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Neighborhoods are publicly readable"
  ON neighborhoods FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert neighborhoods"
  ON neighborhoods FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add address columns to spaces
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS address_street text,
ADD COLUMN IF NOT EXISTS address_city text,
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_zip text,
ADD COLUMN IF NOT EXISTS address_lat float8,
ADD COLUMN IF NOT EXISTS address_lng float8;

-- Seed initial neighborhoods (ignore duplicates)
INSERT INTO neighborhoods (name) VALUES
('LoDo'),
('RiNo'),
('Union Station'),
('Boulder'),
('Highlands'),
('DTC'),
('Golden'),
('Cherry Creek'),
('Five Points'),
('Capitol Hill'),
('Platt Park'),
('Baker'),
('Lakewood'),
('Englewood'),
('Aurora'),
('Centennial'),
('Littleton'),
('Westminster'),
('Arvada'),
('Wheat Ridge'),
('Edgewater'),
('Sloans Lake'),
('Uptown')
ON CONFLICT (name) DO NOTHING;
