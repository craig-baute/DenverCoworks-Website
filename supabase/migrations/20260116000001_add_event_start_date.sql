-- Add start_date column to events table for better sorting and archiving
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_date date;

-- Backfill start_date from the existing date text column where possible
UPDATE public.events 
SET start_date = CAST(date AS date)
WHERE start_date IS NULL AND date ~ '^\w+ \d{1,2}, \d{4}$';
