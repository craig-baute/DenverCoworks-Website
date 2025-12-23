ALTER TABLE public.spaces 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS hours jsonb DEFAULT '{"monday": "9am - 5pm", "tuesday": "9am - 5pm", "wednesday": "9am - 5pm", "thursday": "9am - 5pm", "friday": "9am - 5pm", "saturday": "Closed", "sunday": "Closed"}'::jsonb;

COMMENT ON COLUMN public.spaces.phone IS 'Contact phone number for the coworking space';
COMMENT ON COLUMN public.spaces.hours IS 'Operating hours for different days of the week';
