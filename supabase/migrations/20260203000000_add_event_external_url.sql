-- Add external_url column to events table
ALTER TABLE IF EXISTS public.events 
ADD COLUMN IF NOT EXISTS external_url text;

COMMENT ON COLUMN public.events.external_url IS 'External link for RSVPs (e.g., Luma, Eventbrite)';
