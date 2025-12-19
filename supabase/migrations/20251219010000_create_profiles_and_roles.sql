
-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  full_name text,
  email text,
  notification_settings jsonb DEFAULT '{"email_alerts": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles are readable by the user themselves and admins
CREATE POLICY "Users can read their own profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- 4. Users can update their own profiles
CREATE POLICY "Users can update their own profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. Helper function to get admin emails for Edge Functions (using service role)
CREATE OR REPLACE FUNCTION get_admin_emails()
RETURNS TABLE (email text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT email FROM public.profiles WHERE role = 'super_admin';
$$;
