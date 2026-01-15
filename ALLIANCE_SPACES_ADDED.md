# Alliance Spaces Added to Database

## Summary
Successfully created migration file to add 5 Denver coworking spaces to the Alliance Space Database.

## Migration File
`supabase/migrations/20260115000000_add_alliance_spaces.sql`

## Spaces Added

### 1. Thrive Workplace Ball Park
- **Address:** 1415 Park Ave W, Denver, CO 80205
- **Neighborhood:** LoDo
- **Website:** https://thriveworkplace.com
- **Phone:** 720-800-9944
- **Email:** ballpark@thriveworkplace.com
- **Hours:** Monday-Friday 8am-5pm, Closed weekends
- **Description:** Family-owned coworking space offering customizable office solutions, modern amenities, and multi-location access. Located in the vibrant Ballpark neighborhood with a thoughtful, collaborative culture for freelancers, entrepreneurs, and small businesses.

### 2. Thrive Workplace Arvada
- **Address:** 5610 Ward Road, Suite 300, Arvada, CO 80002
- **Neighborhood:** Arvada
- **Website:** https://thriveworkplace.com/west-arvada/
- **Phone:** 720-800-9946
- **Email:** arvada@thriveworkplace.com
- **Hours:** Monday-Friday 8am-5pm, Closed weekends
- **Description:** Part of the Thrive Workplace family, offering exceptional coworking experience with customizable office solutions, modern amenities, and a thriving community. Perfect for professionals in the western Denver metro area.

### 3. Neuworks
- **Address:** 201 Columbine Street, Suite 300, Denver, CO 80206
- **Neighborhood:** Cherry Creek
- **Website:** https://neu.works
- **Phone:** 720-500-2345
- **Email:** office@neu.works
- **Hours:** Monday-Friday 8am-5pm, 24/7 Member Access on weekends
- **Description:** Denver's premier shared office and coworking space in Cherry Creek North. Offers 57 offices ranging from single-person offices to secure suites for up to 30 people, along with impressive meeting rooms and event space. Work alongside Cherry Creek North's leading founders and executives with 24/7 access.

### 4. Shift Workspaces Corona
- **Address:** 383 Corona Street, Denver, CO 80218
- **Neighborhood:** Capitol Hill
- **Website:** https://shiftworkspaces.com/locations/corona/
- **Phone:** 303-355-5353
- **Email:** hello@shiftworkspaces.com
- **Hours:** Monday-Friday 8am-5pm, Closed weekends
- **Description:** Located in Denver's Alamo Placita District, providing private offices, coworking spaces, and premium amenities in an elegant, refined, and exclusive environment. Offers a welcoming, inspiring setting that supports creativity, productivity, and growth.

### 5. Furniture Creative Coworking
- **Address:** 2626 W. 32nd Avenue, Denver, CO 80211
- **Neighborhood:** Highlands
- **Website:** https://furniturecoworking.com
- **Phone:** 720-772-6719
- **Email:** Not available (contact via website form)
- **Hours:** 24/7 Member Access
- **Description:** A unique creative coworking space founded by Jason Wedekind, combining the energy of a larger design firm with entrepreneurial spirit. Houses graphic designers, interactive designers, software developers, video producers, and invitation designers. Features a working letterpress shop in a historic building formerly used as Denver Fine Furniture.

## Database Changes
The migration also adds an `email` column to the `spaces` table to store contact email addresses for each coworking space.

## Next Steps
To apply this migration to your Supabase database, you have two options:

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20260115000000_add_alliance_spaces.sql`
4. Paste and run the SQL in the editor

### Option 2: Using Supabase CLI
If you have the Supabase CLI installed:
```bash
supabase db push
```

## Notes
- All spaces are marked as "approved" status
- The "vibe" field is left empty as requested - you will fill this in manually
- Email addresses are included where available (Furniture Coworking uses a contact form instead)
- Hours are stored in JSONB format for flexibility
- Placeholder images from Unsplash are used - you may want to replace these with actual space photos
