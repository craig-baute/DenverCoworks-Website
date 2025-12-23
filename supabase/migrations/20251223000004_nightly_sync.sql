-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a helper function to trigger the sync
-- This avoids complicated inline SQL in the cron schedule
CREATE OR REPLACE FUNCTION public.trigger_google_calendar_sync()
RETURNS void AS $$
DECLARE
  project_url text;
  anon_key text;
BEGIN
  -- We attempt to get the project URL from the settings or assume it's set in a known place
  -- In a real Supabase environment, you can use vault or a settings table
  -- For now, we'll use a placeholder that needs to be configured or fetched
  
  -- If you have a custom settings table (like admin_tokens), we can use that to verify connection
  IF EXISTS (SELECT 1 FROM public.admin_tokens WHERE token_type = 'google_oauth' AND refresh_token IS NOT NULL) THEN
    PERFORM net.http_post(
      url := (SELECT current_setting('request.headers', true)::json->>'x-forwarded-proto' || '://' || current_setting('request.headers', true)::json->>'host') || '/functions/v1/sync-google-calendar',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.headers', true)::json->>'apikey' || '"}'::jsonb,
      body := '{}'::jsonb
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the sync every night at 3 AM Denver Time
-- (approx 10:00 UTC)
SELECT cron.schedule(
    'nightly-google-calendar-sync',
    '0 10 * * *',
    'SELECT public.trigger_google_calendar_sync()'
);

COMMENT ON FUNCTION public.trigger_google_calendar_sync() IS 'Triggers the Google Calendar sync Edge Function. Best used within a pg_cron schedule.';
