<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Denver Coworks Alliance Website

A comprehensive website for the Denver Coworks Alliance with an admin panel for managing content, events, blog posts, and more.

## Features

- Content Management System with admin authentication
- Event management with Google Calendar integration
- Blog post creation and management
- Contact form submissions
- Event RSVP tracking
- Media library
- SEO management
- Success stories and testimonials

## Run Locally

**Prerequisites:**  Node.js and a Supabase account

1. Install dependencies:
   ```bash
   npm install
   ```

2. The Supabase database is already configured and connected

3. Run the app:
   ```bash
   npm run dev
   ```

## Admin Setup

To access the admin panel:

1. Click the "Admin Login" link in the footer
2. Create your admin account using the sign-up form with your email and password
3. Once logged in, you can manage all website content

### Creating Your First Admin User

Since this is a new installation, you'll need to create your first admin user:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add user" and create a new user with email/password
4. Use these credentials to log into the admin panel

### Admin Features

Once logged in, you can:
- Manage coworking spaces
- Create and manage events
- Write and publish blog posts
- View contact form submissions
- Track event RSVPs
- Upload and manage media files
- Configure SEO settings for different pages
- Add testimonials and success stories

## Database

The application uses Supabase for:
- PostgreSQL database with Row Level Security
- User authentication
- File storage for media uploads
- Edge functions for Google Calendar integration
