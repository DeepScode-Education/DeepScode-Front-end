# Support Ticket System Setup

## Overview
The support ticket system allows users to submit feedback and bug reports directly from the Support page. Admins can view and manage these tickets through Supabase.

## Database Setup

### 1. Run Migration
To create the `support_tickets` table, run the following command in your Supabase project:

```bash
# If using Supabase CLI locally
npx supabase db push

# Or apply the migration manually in Supabase Dashboard:
# Go to SQL Editor and run the contents of:
# supabase/migrations/20260327232229_create_support_tickets.sql
```

### 2. Table Structure
The `support_tickets` table includes:
- `id`: UUID primary key
- `user_id`: Reference to auth.users
- `issue_type`: 'payment', 'course', 'account', 'technical', 'other'
- `subject`: Brief title
- `description`: Detailed description
- `status`: 'open', 'in_progress', 'resolved', 'closed'
- `priority`: 'low', 'medium', 'high', 'urgent'
- `admin_notes`: Internal notes
- `resolved_at`: Timestamp when resolved
- `created_at`/`updated_at`: Timestamps

### 3. Row Level Security (RLS)
- Users can view and create their own tickets
- Admins can view and update all tickets

## Features

### User Features
- Submit tickets with issue type, subject, and description
- Real-time form validation
- Success/error feedback with toast notifications
- Character limits and required field validation
- Login requirement for ticket submission

### Admin Features
- View all support tickets
- Update ticket status and priority
- Add internal notes
- Filter and search tickets

## Usage

### For Users
1. Navigate to `/support`
2. Fill out the ticket form
3. Select issue type, add subject and description
4. Submit the ticket
5. Receive confirmation

### For Admins
1. Access Supabase Dashboard
2. Go to Table Editor → support_tickets
3. View, filter, and update tickets
4. Use the admin_notes field for internal communication

## Future Enhancements
- Email notifications for ticket updates
- File attachments for bug reports
- Ticket categories and tags
- Priority-based routing
- SLA tracking
- Analytics dashboard