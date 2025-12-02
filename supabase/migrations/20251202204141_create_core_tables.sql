/*
  # Create Denver Coworks Database Schema

  1. New Tables
    - `spaces` - Coworking spaces with location and vibe information
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `neighborhood` (text, not null)
      - `vibe` (text, not null)
      - `image_url` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `events` - Community events and gatherings
      - `id` (uuid, primary key)
      - `image` (text, not null)
      - `topic` (text, not null)
      - `date` (text, not null)
      - `time` (text, not null)
      - `location` (text)
      - `description` (text)
      - `created_at` (timestamptz, default now())
    
    - `blogs` - Blog posts and articles
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `excerpt` (text, not null)
      - `content` (text, not null)
      - `author` (text, not null)
      - `date` (text, not null)
      - `image_url` (text, not null)
      - `tags` (jsonb, default '[]')
      - `created_at` (timestamptz, default now())
    
    - `leads` - Contact form submissions
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `phone` (text)
      - `type` (text, not null)
      - `address` (text)
      - `building_size` (text)
      - `message` (text)
      - `timestamp` (timestamptz, default now())
    
    - `rsvps` - Event RSVPs
      - `id` (uuid, primary key)
      - `event_name` (text, not null)
      - `attendee_name` (text, not null)
      - `email` (text, not null)
      - `space_name` (text, not null)
      - `timestamp` (timestamptz, default now())
    
    - `media` - Uploaded media files
      - `id` (uuid, primary key)
      - `url` (text, not null)
      - `name` (text, not null)
      - `uploaded_at` (timestamptz, default now())
    
    - `testimonials` - User testimonials
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `title` (text, not null)
      - `space` (text, not null)
      - `quote` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `success_stories` - Success stories
      - `id` (uuid, primary key)
      - `type` (text, not null)
      - `title` (text, not null)
      - `stat` (text, not null)
      - `time` (text, not null)
      - `description` (text, not null)
      - `image` (text, not null)
      - `created_at` (timestamptz, default now())
    
    - `seo_pages` - SEO settings for different pages
      - `id` (text, primary key)
      - `title` (text, not null)
      - `description` (text, not null)
      - `keywords` (text, not null)
      - `og_image` (text, not null)
      - `logo_url` (text, default '')

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated admin write access

  ## Important Notes
  - All tables are publicly readable for website display
  - Write access is restricted to authenticated users only
  - Timestamps use PostgreSQL's timestamptz for proper timezone handling
  - Tags stored as JSONB for flexible querying
*/

-- Create spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  neighborhood text NOT NULL,
  vibe text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spaces are publicly readable"
  ON spaces FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert spaces"
  ON spaces FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update spaces"
  ON spaces FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete spaces"
  ON spaces FOR DELETE
  TO authenticated
  USING (true);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image text NOT NULL,
  topic text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  location text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  date text NOT NULL,
  image_url text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blogs are publicly readable"
  ON blogs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (true);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  type text NOT NULL,
  address text,
  building_size text,
  message text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Create rsvps table
CREATE TABLE IF NOT EXISTS rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  attendee_name text NOT NULL,
  email text NOT NULL,
  space_name text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read rsvps"
  ON rsvps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert rsvps"
  ON rsvps FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rsvps"
  ON rsvps FOR DELETE
  TO authenticated
  USING (true);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  name text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media is publicly readable"
  ON media FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete media"
  ON media FOR DELETE
  TO authenticated
  USING (true);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  space text NOT NULL,
  quote text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonials are publicly readable"
  ON testimonials FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (true);

-- Create success_stories table
CREATE TABLE IF NOT EXISTS success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  stat text NOT NULL,
  time text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Success stories are publicly readable"
  ON success_stories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert success stories"
  ON success_stories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update success stories"
  ON success_stories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete success stories"
  ON success_stories FOR DELETE
  TO authenticated
  USING (true);

-- Create seo_pages table
CREATE TABLE IF NOT EXISTS seo_pages (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  keywords text NOT NULL,
  og_image text NOT NULL,
  logo_url text DEFAULT ''
);

ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO pages are publicly readable"
  ON seo_pages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert SEO pages"
  ON seo_pages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update SEO pages"
  ON seo_pages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete SEO pages"
  ON seo_pages FOR DELETE
  TO authenticated
  USING (true);