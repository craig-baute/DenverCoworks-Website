/*
  # New Application Workflow System
  
  1. New Tables
    - `pending_applications` - Stores applications awaiting admin approval
    - `contacts` - Contact list with tags for approved members
  
  2. Changes
    - Simplified application process
    - Pending user system
    - Contact list tracking
*/

-- 1. Create pending_applications table
CREATE TABLE IF NOT EXISTS public.pending_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_name text NOT NULL,
  space_address text NOT NULL,
  applicant_name text NOT NULL,
  applicant_email text NOT NULL,
  role_in_company text NOT NULL CHECK (role_in_company IN ('Owner', 'Manager')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  notes text
);

-- 2. Create contacts table for approved members
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  space_name text,
  role_in_company text,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on pending_applications
ALTER TABLE public.pending_applications ENABLE ROW LEVEL SECURITY;

-- 4. Only admins can view pending applications
CREATE POLICY "Admins can view all pending applications"
  ON public.pending_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- 5. Only admins can update pending applications
CREATE POLICY "Admins can update pending applications"
  ON public.pending_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- 6. Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 7. Admins can view all contacts
CREATE POLICY "Admins can view all contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- 8. Admins can manage contacts
CREATE POLICY "Admins can manage contacts"
  ON public.contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- 9. Users can view their own contact record
CREATE POLICY "Users can view their own contact"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_applications_status ON public.pending_applications(status);
CREATE INDEX IF NOT EXISTS idx_pending_applications_email ON public.pending_applications(applicant_email);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON public.contacts USING GIN(tags);

-- 11. Add updated_at trigger for pending_applications
CREATE OR REPLACE FUNCTION update_pending_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pending_applications_updated_at
  BEFORE UPDATE ON public.pending_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_applications_updated_at();

-- 12. Add updated_at trigger for contacts
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contacts_updated_at();

-- 13. Add space_id to profiles table to link users to their spaces
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE SET NULL;

-- 14. Add role_in_company to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role_in_company text;
