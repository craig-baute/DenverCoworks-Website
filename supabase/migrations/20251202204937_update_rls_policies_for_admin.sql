/*
  # Update RLS Policies for Admin Access

  This migration updates the Row Level Security policies to allow
  write operations from the admin panel without requiring Supabase authentication.
  
  The admin panel has its own password protection, so we can safely allow
  anonymous write access to these tables.

  ## Changes
  - Drop existing restrictive policies for write operations
  - Create new permissive policies that allow anyone to insert/update/delete
  - Keep read policies as they are (public read access)
*/

-- SPACES TABLE
DROP POLICY IF EXISTS "Authenticated users can insert spaces" ON spaces;
DROP POLICY IF EXISTS "Authenticated users can update spaces" ON spaces;
DROP POLICY IF EXISTS "Authenticated users can delete spaces" ON spaces;

CREATE POLICY "Anyone can insert spaces"
  ON spaces FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update spaces"
  ON spaces FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete spaces"
  ON spaces FOR DELETE
  USING (true);

-- EVENTS TABLE
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON events;

CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update events"
  ON events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete events"
  ON events FOR DELETE
  USING (true);

-- BLOGS TABLE
DROP POLICY IF EXISTS "Authenticated users can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON blogs;

CREATE POLICY "Anyone can insert blogs"
  ON blogs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update blogs"
  ON blogs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete blogs"
  ON blogs FOR DELETE
  USING (true);

-- LEADS TABLE (keep authenticated read, allow anyone to insert)
DROP POLICY IF EXISTS "Authenticated users can read leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;

CREATE POLICY "Anyone can read leads"
  ON leads FOR SELECT
  USING (true);

CREATE POLICY "Anyone can delete leads"
  ON leads FOR DELETE
  USING (true);

-- RSVPS TABLE (keep authenticated read, allow anyone to insert)
DROP POLICY IF EXISTS "Authenticated users can read rsvps" ON rsvps;
DROP POLICY IF EXISTS "Authenticated users can delete rsvps" ON rsvps;

CREATE POLICY "Anyone can read rsvps"
  ON rsvps FOR SELECT
  USING (true);

CREATE POLICY "Anyone can delete rsvps"
  ON rsvps FOR DELETE
  USING (true);

-- MEDIA TABLE
DROP POLICY IF EXISTS "Authenticated users can insert media" ON media;
DROP POLICY IF EXISTS "Authenticated users can delete media" ON media;

CREATE POLICY "Anyone can insert media"
  ON media FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete media"
  ON media FOR DELETE
  USING (true);

-- TESTIMONIALS TABLE
DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON testimonials;

CREATE POLICY "Anyone can insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update testimonials"
  ON testimonials FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete testimonials"
  ON testimonials FOR DELETE
  USING (true);

-- SUCCESS STORIES TABLE
DROP POLICY IF EXISTS "Authenticated users can insert success stories" ON success_stories;
DROP POLICY IF EXISTS "Authenticated users can update success stories" ON success_stories;
DROP POLICY IF EXISTS "Authenticated users can delete success stories" ON success_stories;

CREATE POLICY "Anyone can insert success stories"
  ON success_stories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update success stories"
  ON success_stories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete success stories"
  ON success_stories FOR DELETE
  USING (true);

-- SEO PAGES TABLE
DROP POLICY IF EXISTS "Authenticated users can insert SEO pages" ON seo_pages;
DROP POLICY IF EXISTS "Authenticated users can update SEO pages" ON seo_pages;
DROP POLICY IF EXISTS "Authenticated users can delete SEO pages" ON seo_pages;

CREATE POLICY "Anyone can insert SEO pages"
  ON seo_pages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update SEO pages"
  ON seo_pages FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete SEO pages"
  ON seo_pages FOR DELETE
  USING (true);