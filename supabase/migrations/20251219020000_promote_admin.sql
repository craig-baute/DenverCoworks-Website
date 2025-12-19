
-- This script upgrades the existing user to Super Admin and ensures their profile exists.
-- It can be safely re-run as it uses ON CONFLICT.

INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, email, 'super_admin', 'Craig Baute'
FROM auth.users
WHERE email = 'bautecm@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'super_admin',
    full_name = 'Craig Baute',
    email = EXCLUDED.email;
