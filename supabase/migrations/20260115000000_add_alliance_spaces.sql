/*
  # Add Alliance Spaces to Database
  
  1. Add email column to spaces table
  2. Add 5 Denver coworking spaces to the Alliance Space Database:
     - Thrive Workplace Ball Park
     - Thrive Workplace Arvada
     - Neuworks
     - Shift Workspaces Corona
     - Furniture Creative Coworking
  
  Each space includes: name, address, neighborhood, website, hours, description, phone, and email
*/

-- Add missing columns to spaces table if they don't exist
ALTER TABLE public.spaces 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS hours jsonb DEFAULT '{"monday": "9am - 5pm", "tuesday": "9am - 5pm", "wednesday": "9am - 5pm", "thursday": "9am - 5pm", "friday": "9am - 5pm", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.spaces.phone IS 'Contact phone number for the coworking space';
COMMENT ON COLUMN public.spaces.hours IS 'Operating hours for different days of the week';
COMMENT ON COLUMN public.spaces.email IS 'Contact email address for the coworking space';

-- Insert Thrive Workplace Ball Park
INSERT INTO public.spaces (
  name,
  neighborhood,
  vibe,
  address,
  address_street,
  address_city,
  address_state,
  address_zip,
  website,
  description,
  phone,
  email,
  hours,
  image_url,
  status
) VALUES (
  'Thrive Workplace Ball Park',
  'LoDo',
  'Industrial Chic',
  '1415 Park Ave W, Denver, CO 80205',
  '1415 Park Ave W',
  'Denver',
  'CO',
  '80205',
  'https://thriveworkplace.com',
  'Thrive Workplace is a family-owned coworking space offering customizable office solutions, modern amenities, and multi-location access. Located in the vibrant Ballpark neighborhood, Thrive provides a thoughtful, collaborative culture for freelancers, entrepreneurs, and small businesses with flexible pricing and results-driven services.',
  '720-800-9944',
  'ballpark@thriveworkplace.com',
  '{"monday": "8am - 5pm", "tuesday": "8am - 5pm", "wednesday": "8am - 5pm", "thursday": "8am - 5pm", "friday": "8am - 5pm", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
  'approved'
);

-- Insert Thrive Workplace Arvada
INSERT INTO public.spaces (
  name,
  neighborhood,
  vibe,
  address,
  address_street,
  address_city,
  address_state,
  address_zip,
  website,
  description,
  phone,
  email,
  hours,
  image_url,
  status
) VALUES (
  'Thrive Workplace Arvada',
  'Arvada',
  'Community Focused',
  '5610 Ward Road, Suite 300, Arvada, CO 80002',
  '5610 Ward Road, Suite 300',
  'Arvada',
  'CO',
  '80002',
  'https://thriveworkplace.com/west-arvada/',
  'Part of the Thrive Workplace family, the Arvada location offers the same exceptional coworking experience with customizable office solutions, modern amenities, and a thriving community. Perfect for professionals in the western Denver metro area seeking flexible workspace with a collaborative culture.',
  '720-800-9946',
  'arvada@thriveworkplace.com',
  '{"monday": "8am - 5pm", "tuesday": "8am - 5pm", "wednesday": "8am - 5pm", "thursday": "8am - 5pm", "friday": "8am - 5pm", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
  'approved'
);

-- Insert Neuworks
INSERT INTO public.spaces (
  name,
  neighborhood,
  vibe,
  address,
  address_street,
  address_city,
  address_state,
  address_zip,
  website,
  description,
  phone,
  email,
  hours,
  image_url,
  status
) VALUES (
  'Neuworks',
  'Cherry Creek',
  'Executive Suite',
  '201 Columbine Street, Suite 300, Denver, CO 80206',
  '201 Columbine Street, Suite 300',
  'Denver',
  'CO',
  '80206',
  'https://neu.works',
  'Denver''s premier shared office and coworking space in Cherry Creek North. Neuworks offers 57 offices ranging from single-person offices to secure suites for up to 30 people, along with impressive meeting rooms and event space. Work alongside Cherry Creek North''s leading founders and executives with 24/7 access in a sophisticated environment.',
  '720-500-2345',
  'office@neu.works',
  '{"monday": "8am - 5pm", "tuesday": "8am - 5pm", "wednesday": "8am - 5pm", "thursday": "8am - 5pm", "friday": "8am - 5pm", "saturday": "24/7 Member Access", "sunday": "24/7 Member Access"}'::jsonb,
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
  'approved'
);

-- Insert Shift Workspaces Corona
INSERT INTO public.spaces (
  name,
  neighborhood,
  vibe,
  address,
  address_street,
  address_city,
  address_state,
  address_zip,
  website,
  description,
  phone,
  email,
  hours,
  image_url,
  status
) VALUES (
  'Shift Workspaces Corona',
  'Capitol Hill',
  'Luxury Professional',
  '383 Corona Street, Denver, CO 80218',
  '383 Corona Street',
  'Denver',
  'CO',
  '80218',
  'https://shiftworkspaces.com/locations/corona/',
  'Located in Denver''s Alamo Placita District, Shift Workspaces Corona provides private offices, coworking spaces, and premium amenities in an elegant, refined, and exclusive environment. The space offers a welcoming, inspiring setting that supports creativity, productivity, and growth with thoughtfully designed workspaces.',
  '303-355-5353',
  'hello@shiftworkspaces.com',
  '{"monday": "8am - 5pm", "tuesday": "8am - 5pm", "wednesday": "8am - 5pm", "thursday": "8am - 5pm", "friday": "8am - 5pm", "saturday": "Closed", "sunday": "Closed"}'::jsonb,
  'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800',
  'approved'
);

-- Insert Furniture Creative Coworking
INSERT INTO public.spaces (
  name,
  neighborhood,
  vibe,
  address,
  address_street,
  address_city,
  address_state,
  address_zip,
  website,
  description,
  phone,
  email,
  hours,
  image_url,
  status
) VALUES (
  'Furniture Creative Coworking',
  'Highlands',
  'Artistic & Raw',
  '2626 W. 32nd Avenue, Denver, CO 80211',
  '2626 W. 32nd Avenue',
  'Denver',
  'CO',
  '80211',
  'https://furniturecoworking.com',
  'A unique creative coworking space founded by Jason Wedekind, combining the energy of a larger design firm with entrepreneurial spirit. Furniture houses graphic designers, interactive designers, software developers, video producers, and invitation designers. The space features a working letterpress shop and offers 24/7 member access in a historic building formerly used as Denver Fine Furniture.',
  '720-772-6719',
  NULL,
  '{"monday": "24/7 Member Access", "tuesday": "24/7 Member Access", "wednesday": "24/7 Member Access", "thursday": "24/7 Member Access", "friday": "24/7 Member Access", "saturday": "24/7 Member Access", "sunday": "24/7 Member Access"}'::jsonb,
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
  'approved'
);

