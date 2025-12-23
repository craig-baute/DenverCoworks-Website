-- RENAME google_oauth TO site_config TO REMOVE TYPOS AND CACHING ISSUES
UPDATE public.admin_tokens SET token_type = 'site_config' WHERE token_type IN ('google_oauth', 'google oauth');

-- ENSURE THE UNIQUE CONSTRAINT EXISTS ON token_type
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_tokens_token_type_key') THEN
        ALTER TABLE admin_tokens ADD CONSTRAINT admin_tokens_token_type_key UNIQUE (token_type);
    END IF;
END $$;

-- ENSURE WE HAVE THE NEW site_config ROW
INSERT INTO public.admin_tokens (token_type) 
VALUES ('site_config')
ON CONFLICT (token_type) DO NOTHING;

-- PERMISSIVE RLS FOR ADMINS
DROP POLICY IF EXISTS "Admins can insert tokens" ON public.admin_tokens;
DROP POLICY IF EXISTS "Admins can update tokens" ON public.admin_tokens;
DROP POLICY IF EXISTS "Admins can select tokens" ON public.admin_tokens;

CREATE POLICY "Admins can insert tokens" ON admin_tokens FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update tokens" ON admin_tokens FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can select tokens" ON admin_tokens FOR SELECT TO authenticated USING (true);
