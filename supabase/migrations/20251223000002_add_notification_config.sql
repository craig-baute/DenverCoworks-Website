-- Add notification columns to admin_tokens (where site config currently lives)
ALTER TABLE public.admin_tokens 
ADD COLUMN IF NOT EXISTS notify_landlord_emails text,
ADD COLUMN IF NOT EXISTS notify_expert_emails text,
ADD COLUMN IF NOT EXISTS notify_new_space_emails text;

COMMENT ON COLUMN public.admin_tokens.notify_landlord_emails IS 'Comma-separated emails to notify for landlord/expert forms';
COMMENT ON COLUMN public.admin_tokens.notify_expert_emails IS 'Comma-separated emails to notify for expert inquiry forms';
COMMENT ON COLUMN public.admin_tokens.notify_new_space_emails IS 'Comma-separated emails to notify for new space submissions';
