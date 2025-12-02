/*
  # Google Calendar Integration Schema

  1. Schema Changes
    - Add `google_calendar_event_id` column to `events` table
      - Stores the Google Calendar Event ID for syncing attendees
    
  2. New Tables
    - `admin_tokens`
      - `id` (uuid, primary key)
      - `token_type` (text) - identifier like 'google_oauth'
      - `access_token` (text) - current access token (will expire)
      - `refresh_token` (text) - refresh token for obtaining new access tokens
      - `expires_at` (timestamptz) - when the access token expires
      - `scope` (text) - OAuth scopes granted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  3. Security
    - Enable RLS on `admin_tokens` table
    - Only authenticated users can read tokens (for Edge Functions)
    - Very restrictive - tokens are sensitive data

  Important Notes:
  - The refresh_token from Google OAuth must be stored securely
  - Edge Functions will use this to generate new access tokens
  - The google_calendar_event_id links our events to Google Calendar events
*/

-- Add google_calendar_event_id to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'google_calendar_event_id'
  ) THEN
    ALTER TABLE events ADD COLUMN google_calendar_event_id text;
  END IF;
END $$;

-- Create admin_tokens table for storing OAuth tokens
CREATE TABLE IF NOT EXISTS admin_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_type text NOT NULL DEFAULT 'google_oauth',
  access_token text,
  refresh_token text NOT NULL,
  expires_at timestamptz,
  scope text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can read tokens" ON admin_tokens;
  DROP POLICY IF EXISTS "Service role can manage tokens" ON admin_tokens;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policy: Only authenticated users can read tokens (for Edge Functions)
CREATE POLICY "Authenticated users can read tokens"
  ON admin_tokens
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role can manage tokens
CREATE POLICY "Service role can manage tokens"
  ON admin_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_tokens_type'
  ) THEN
    CREATE INDEX idx_admin_tokens_type ON admin_tokens(token_type);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_google_calendar_id'
  ) THEN
    CREATE INDEX idx_events_google_calendar_id ON events(google_calendar_event_id);
  END IF;
END $$;
