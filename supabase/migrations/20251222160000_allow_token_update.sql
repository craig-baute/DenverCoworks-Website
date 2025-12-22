-- Allow authenticated users to update the calendar_id in admin_tokens
-- This is needed because the Admin dashboard uses the client SDK to save this setting.

-- First, check if a policy already exists for updating and drop it to be safe
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admins can update tokens" ON admin_tokens;
END $$;

-- Create the new policy
CREATE POLICY "Admins can update tokens"
  ON admin_tokens
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Note: We are using USING (true) for now to match the permissive style of the rest of the app,
-- but in a production environment with multiple user levels, we should check for a super_admin role.
