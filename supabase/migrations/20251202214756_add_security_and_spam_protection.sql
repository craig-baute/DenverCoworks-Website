/*
  # Security and Anti-Spam Protection Schema

  1. New Tables
    - `rate_limits`
      - `id` (uuid, primary key)
      - `identifier` (text) - IP address or email hash
      - `action_type` (text) - type of action (rsvp, contact, apply)
      - `attempts` (integer) - number of attempts
      - `last_attempt` (timestamptz) - timestamp of last attempt
      - `blocked_until` (timestamptz) - temporary block expiration
      - `created_at` (timestamptz)
    
    - `spam_log`
      - `id` (uuid, primary key)
      - `identifier` (text) - IP or email
      - `action_type` (text)
      - `reason` (text) - why it was flagged as spam
      - `form_data` (jsonb) - captured data for review
      - `created_at` (timestamptz)
    
    - `blocked_ips`
      - `id` (uuid, primary key)
      - `ip_address` (text)
      - `reason` (text)
      - `blocked_at` (timestamptz)
      - `expires_at` (timestamptz) - null for permanent blocks

  2. Security Features
    - Rate limiting by IP/email
    - Spam detection logging
    - IP blocking capability
    - Automatic cleanup of old records

  3. RLS Policies
    - Service role can manage all tables
    - Public can check their own rate limit status
*/

-- Rate Limits Table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  attempts integer DEFAULT 1,
  last_attempt timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Spam Log Table
CREATE TABLE IF NOT EXISTS spam_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action_type text NOT NULL,
  reason text NOT NULL,
  form_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text NOT NULL,
  blocked_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE spam_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Service role can manage rate limits" ON rate_limits;
  DROP POLICY IF EXISTS "Service role can manage spam log" ON spam_log;
  DROP POLICY IF EXISTS "Service role can manage blocked ips" ON blocked_ips;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policies: Service role can manage everything
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage spam log"
  ON spam_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage blocked ips"
  ON blocked_ips
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rate_limits_identifier_action'
  ) THEN
    CREATE INDEX idx_rate_limits_identifier_action ON rate_limits(identifier, action_type);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_rate_limits_last_attempt'
  ) THEN
    CREATE INDEX idx_rate_limits_last_attempt ON rate_limits(last_attempt);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_blocked_ips_address'
  ) THEN
    CREATE INDEX idx_blocked_ips_address ON blocked_ips(ip_address);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_spam_log_created'
  ) THEN
    CREATE INDEX idx_spam_log_created ON spam_log(created_at);
  END IF;
END $$;

-- Function to clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE last_attempt < now() - interval '24 hours'
    AND (blocked_until IS NULL OR blocked_until < now());
END;
$$;

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION is_ip_blocked(ip text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  blocked boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM blocked_ips
    WHERE ip_address = ip
      AND (expires_at IS NULL OR expires_at > now())
  ) INTO blocked;
  
  RETURN blocked;
END;
$$;
