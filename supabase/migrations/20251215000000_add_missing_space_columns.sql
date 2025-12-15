/*
  # Add missing columns to spaces table
  
  1. Changes
     - Add `address` (text)
     - Add `description` (text)
     - Add `website` (text)
     - Add `status` (text) with default 'pending'
     - Add `owner_id` (uuid) with foreign key reference
     - Add `images` (text array)
     - Add `video_url` (text)
     - Add `amenities` (text array)
*/

ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT ARRAY[]::text[];
