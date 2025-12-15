-- Add calendar_id column to admin_tokens table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_tokens' AND column_name = 'calendar_id'
  ) THEN
    ALTER TABLE admin_tokens ADD COLUMN calendar_id text DEFAULT 'primary';
  END IF;
END $$;
