ALTER TABLE public.admin_tokens 
ADD COLUMN IF NOT EXISTS ga4_measurement_id text,
ADD COLUMN IF NOT EXISTS clarity_project_id text;

COMMENT ON COLUMN public.admin_tokens.ga4_measurement_id IS 'Google Analytics 4 Measurement ID (e.g., G-XXXXXXX)';
COMMENT ON COLUMN public.admin_tokens.clarity_project_id IS 'Microsoft Clarity Project ID';
