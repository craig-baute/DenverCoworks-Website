# New Application Workflow - Implementation Guide

## Overview
The application process has been completely redesigned to be simpler and more streamlined. The new workflow focuses on collecting essential information upfront, with detailed space profile completion happening after admin approval.

## What Changed

### Old Workflow ❌
1. User fills out complex form with space details, vibe, website, etc.
2. Submission creates a "pending" space directly in the spaces table
3. Admin approves/rejects the space
4. User has no account or login

### New Workflow ✅
1. User fills out simple form (just name, email, space name, address, role)
2. Application stored in `pending_applications` table
3. Admin receives email notification
4. Admin approves application via admin panel
5. System sends magic link to user's email
6. User clicks link, sets password, completes space profile
7. User added to contacts list with tags
8. User can now log in and manage their space

---

## Database Changes

### New Tables Created

#### 1. `pending_applications`
Stores applications awaiting admin review.

**Columns:**
- `id` - UUID primary key
- `space_name` - Name of the coworking space
- `space_address` - Physical address
- `applicant_name` - Person applying
- `applicant_email` - Email address
- `role_in_company` - Either 'Owner' or 'Manager'
- `status` - 'pending', 'approved', or 'rejected'
- `created_at` - When application was submitted
- `approved_at` - When admin approved it
- `approved_by` - Which admin approved it
- `rejection_reason` - Optional reason for rejection
- `notes` - Admin notes

#### 2. `contacts`
Contact list for all approved members with tags.

**Columns:**
- `id` - UUID primary key
- `user_id` - Links to auth.users (null until account created)
- `email` - Contact email (unique)
- `full_name` - Contact name
- `space_name` - Their space name
- `role_in_company` - Their role
- `tags` - Array of tags (e.g., ['pending_account', 'new_member', 'owner'])
- `created_at` / `updated_at` - Timestamps

### Updated Tables

#### `profiles`
Added two new columns:
- `space_id` - Links user to their space
- `role_in_company` - Their role (Owner/Manager)

---

## New Edge Functions

### 1. `handle-application`
**Purpose:** Process new application submissions

**Endpoint:** `/functions/v1/handle-application`

**Request Body:**
```json
{
  "spaceName": "Denver Creative Hub",
  "spaceAddress": "456 Broadway, Denver, CO 80203",
  "applicantName": "Jane Smith",
  "applicantEmail": "jane@example.com",
  "roleInCompany": "Owner"
}
```

**What it does:**
1. Validates required fields
2. Checks for duplicate pending applications
3. Saves to `pending_applications` table
4. Sends email notification to admins
5. Sends confirmation email to applicant

### 2. `approve-application`
**Purpose:** Approve an application and trigger account creation

**Endpoint:** `/functions/v1/approve-application`

**Request Body:**
```json
{
  "applicationId": "uuid-here",
  "adminId": "admin-uuid-here"
}
```

**What it does:**
1. Updates application status to 'approved'
2. Adds contact to `contacts` table with tags
3. Generates magic link for account creation
4. Sends welcome email with account setup link

---

## Frontend Components

### 1. **ApplyPage.tsx** (Updated)
**Route:** `/join`

**Simplified Form Fields:**
- Space Name
- Space Address
- Your Name
- Your Email
- Your Role (Owner/Manager dropdown)

**Features:**
- Honeypot spam protection
- Success confirmation screen
- Calls `handle-application` Edge Function

### 2. **OnboardingPage.tsx** (New)
**Route:** `/onboarding/complete-profile`

**Two-Step Process:**

**Step 1: Set Password**
- User creates secure password (min 8 characters)
- Password confirmation field
- Uses Supabase auth.updateUser()

**Step 2: Complete Space Profile**
- Space Name (pre-filled from application)
- Address
- Website
- Image URL
- Description
- Amenities (multi-select buttons)
- Creates space in database
- Links user profile to space
- Updates contact tags to 'active_member', 'onboarded'

---

## Admin Workflow

### Viewing Applications
Admins will need a new section in the Admin panel to:
1. View all pending applications
2. See applicant details
3. Approve or reject applications
4. Add notes

**TODO:** Create `ApplicationsManager` component in Admin panel

### Approving an Application
When admin clicks "Approve":
1. Calls `approve-application` Edge Function
2. Application status changes to 'approved'
3. Contact added to database
4. User receives welcome email with magic link
5. Magic link expires in 24 hours

---

## Email Notifications

### 1. Admin Notification (New Application)
**Sent to:** Super admins or configured notification emails
**Subject:** "New Alliance Application: [Space Name]"
**Contains:**
- Applicant name and email
- Role in company
- Space name and address
- Link to admin dashboard

### 2. Applicant Confirmation (Application Received)
**Sent to:** Applicant
**Subject:** "Your Denver Coworks Application is Under Review"
**Contains:**
- Thank you message
- Confirmation that application was received
- Next steps information

### 3. Approval Welcome Email
**Sent to:** Approved applicant
**Subject:** "🎉 Welcome to Denver Coworks Alliance!"
**Contains:**
- Congratulations message
- "Create Your Account" button with magic link
- Instructions for next steps
- Link expiration notice (24 hours)

---

## User Journey

### For New Applicants

1. **Visit `/join`**
   - Fill out simple 5-field form
   - Submit application

2. **Receive Confirmation Email**
   - "Application is under review"
   - Wait for admin approval

3. **Receive Welcome Email** (after approval)
   - Click "Create Your Account" button
   - Redirected to `/onboarding/complete-profile`

4. **Set Password**
   - Create secure password
   - Confirm password

5. **Complete Space Profile**
   - Fill out detailed space information
   - Select amenities
   - Submit profile

6. **Welcome Aboard!**
   - Profile created
   - Added to contacts with 'active_member' tag
   - Can now log in at `/partner`

---

## Contact List & Tags

### Tag System
The `contacts` table uses tags to track member status:

**Initial Tags (on approval):**
- `pending_account` - Hasn't created account yet
- `new_member` - Recently approved
- `owner` or `manager` - Based on their role

**After Onboarding:**
- `active_member` - Has completed profile
- `onboarded` - Finished onboarding process

### Use Cases for Tags
- Filter contacts by status
- Send targeted email campaigns
- Track onboarding completion
- Identify inactive members

---

## Deployment Steps

### 1. Run Database Migration
```bash
# The migration file has been created:
supabase/migrations/20260113000000_create_application_workflow.sql

# Apply it locally:
supabase db reset

# Or push to remote:
supabase db push
```

### 2. Deploy Edge Functions
```bash
# Deploy the new functions:
supabase functions deploy handle-application
supabase functions deploy approve-application
```

### 3. Test the Workflow
1. Submit test application at `/join`
2. Check admin email for notification
3. Approve application (via Edge Function or admin panel)
4. Check applicant email for welcome message
5. Click magic link
6. Complete onboarding
7. Verify user can log in

---

## Next Steps (TODO)

### High Priority
1. **Create Admin Applications Manager**
   - Component to view pending applications
   - Approve/reject buttons
   - Add notes functionality
   - Filter by status

2. **Test Email Delivery**
   - Verify Resend API key is configured
   - Test all three email types
   - Check spam folders

3. **Add Rejection Flow**
   - Create Edge Function for rejecting applications
   - Email template for rejection
   - Optional rejection reason field

### Medium Priority
4. **Enhance Onboarding**
   - Add image upload capability
   - Hours of operation selector
   - Neighborhood dropdown
   - Vibe selector

5. **Contact List Management**
   - Admin interface to view contacts
   - Tag management
   - Export to CSV
   - Email campaign integration

6. **Magic Link Resend**
   - If link expires, allow user to request new one
   - Rate limiting on resend requests

### Low Priority
7. **Application Analytics**
   - Track application conversion rate
   - Average approval time
   - Most common rejection reasons

8. **Automated Reminders**
   - Remind admins of pending applications
   - Remind users to complete onboarding

---

## Security Considerations

### Row Level Security (RLS)
All new tables have RLS enabled:
- `pending_applications` - Only admins can view/update
- `contacts` - Admins can manage, users can view their own

### Magic Link Security
- Links expire in 24 hours
- One-time use only
- Secure token generation via Supabase Auth

### Password Requirements
- Minimum 8 characters
- Confirmation required
- Hashed by Supabase Auth

---

## Troubleshooting

### Application Not Submitting
- Check browser console for errors
- Verify Edge Function is deployed
- Check Supabase logs

### Email Not Received
- Verify Resend API key in environment variables
- Check spam folder
- Verify email address in admin_tokens table

### Magic Link Not Working
- Link may have expired (24 hours)
- Check if user already has an account
- Verify PUBLIC_URL environment variable

### Profile Creation Failing
- Check if space with same name exists
- Verify user is authenticated
- Check database constraints

---

## Environment Variables Required

```env
# Supabase
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for emails)
RESEND_API_KEY=your-resend-api-key

# Public URL (for magic links)
PUBLIC_URL=https://denvercoworks.org
```

---

## Files Modified/Created

### New Files
- `supabase/migrations/20260113000000_create_application_workflow.sql`
- `supabase/functions/handle-application/index.ts`
- `supabase/functions/approve-application/index.ts`
- `components/OnboardingPage.tsx`

### Modified Files
- `components/ApplyPage.tsx` - Simplified form
- `App.tsx` - Added onboarding route

---

## Summary

This new workflow provides:
- ✅ Simpler application process
- ✅ Better admin control
- ✅ Proper user account creation
- ✅ Contact list management
- ✅ Email notifications at every step
- ✅ Secure password-based authentication
- ✅ Tag-based member tracking

The system is now ready for testing. Once the Admin Applications Manager component is built, the full workflow will be complete!
