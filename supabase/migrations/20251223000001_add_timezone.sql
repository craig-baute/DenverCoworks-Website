-- Add timezone to admin_tokens
ALTER TABLE public.admin_tokens ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'America/Denver';
