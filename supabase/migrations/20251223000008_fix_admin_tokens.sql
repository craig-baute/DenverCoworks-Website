-- Fix admin_tokens schema to allow saving site settings without OAuth
ALTER TABLE admin_tokens ALTER COLUMN refresh_token DROP NOT NULL;

-- Ensure token_type is unique so we can upsert safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_tokens_token_type_key') THEN
        ALTER TABLE admin_tokens ADD CONSTRAINT admin_tokens_token_type_key UNIQUE (token_type);
    END IF;
END $$;

-- Allow authenticated users to insert/upsert (for initial settings)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admins can insert tokens" ON admin_tokens;
END $$;

CREATE POLICY "Admins can insert tokens"
  ON admin_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure at least one row exists for site settings
INSERT INTO admin_tokens (token_type, refresh_token)
VALUES ('google_oauth', '')
ON CONFLICT (token_type) DO NOTHING;
