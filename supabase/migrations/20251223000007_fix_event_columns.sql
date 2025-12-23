-- Ensure start_time and duration_minutes columns exist on events table
-- This fixes the 'column not found' error in the schema cache
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE events ADD COLUMN start_time time DEFAULT '18:00';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE events ADD COLUMN duration_minutes integer DEFAULT 60;
  END IF;
END $$;
