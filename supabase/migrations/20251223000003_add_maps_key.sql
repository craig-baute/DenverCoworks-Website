ALTER TABLE public.admin_tokens ADD COLUMN IF NOT EXISTS google_maps_api_key text;

COMMENT ON COLUMN public.admin_tokens.google_maps_api_key IS 'API key for Google Maps and Places Autocomplete';
