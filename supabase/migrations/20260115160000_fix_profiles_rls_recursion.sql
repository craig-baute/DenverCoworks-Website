
-- Fix for RLS infinite recursion on profiles table
-- This occurs when a policy on 'profiles' tries to query 'profiles' to check roles.

-- 1. Create a security definer function to check admin status safely
-- This function runs with the privileges of the creator (bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
$$;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all pending applications" ON public.pending_applications;
DROP POLICY IF EXISTS "Admins can update pending applications" ON public.pending_applications;

-- 3. Re-create the policies using the new helper function
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can view all pending applications"
  ON public.pending_applications FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update pending applications"
  ON public.pending_applications FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Ensure the 'is_admin' function is usable by authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
