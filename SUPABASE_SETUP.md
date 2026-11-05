# Supabase Architecture & Integration Guide
**Dubai Oasis Lions Club — Lions Year 2026–2027**  
*Apple-Inspired Frontend, CMS Admin Dashboard & Backend Preparation*

---

## 1. Database Entity Inventory & Table Relationships

The database architecture is designed with strict relational integrity, UUID primary keys, and granular privacy controls:

| Table | Entity / Purpose | Relationships & Foreign Keys | Privacy / RLS Invariant |
| :--- | :--- | :--- | :--- |
| `user_roles` | Admin & Editor authorization | `user_id` &rarr; `auth.users(id)` (ON DELETE CASCADE) | Admin only (`auth_is_admin()`) |
| `members` | Club members directory & family data | Referenced by `leadership_assignments`, `member_children` | Public reads `is_public = true` only. Family details strictly gated by `family_details_approved`. |
| `member_children` | Relational children records | `member_id` &rarr; `members(id)` (ON DELETE CASCADE) | Public reads only when parent member is public and `family_details_approved = true`. |
| `leadership_assignments` | Executive leadership positions for Lions Year | `member_id` &rarr; `members(id)` (ON DELETE CASCADE) | Public reads `is_active = true`. President (left), Secretary (center), Treasurer (right). |
| `news_articles` | Editorial bulletins & announcements | Author references `auth.users` | Public reads `status = 'published'` only. |
| `events` | Upcoming events & service programs | Organizers reference `auth.users` | Public reads `status = 'published'` only. |
| `projects` | Core service pillars & impact initiatives | Managed by authorized staff | Public reads `status = 'published'` only. |
| `contact_enquiries` | Membership & community enquiries | Private to club secretariat | Anonymous users: **INSERT only**; reads/updates restricted to authenticated staff. |
| `site_settings` | Global configuration & theme variables | Key-value store | Public reads general settings; writes admin only. |
| `impact_metrics` | Quantified community service impact | Display order | Public reads active metrics. |

---

## 2. Required Columns & Entity Specifications

### 2.1 Members (`members`)
- `id` (UUID PK, default `uuid_generate_v4()`)
- `name_prefix` (VARCHAR, default `'Lion'`)
- `first_name` (VARCHAR NOT NULL)
- `last_name` (VARCHAR NOT NULL)
- `public_role` (VARCHAR)
- `committee` (VARCHAR)
- `biography` (TEXT — personal notes / admin entry only)
- `date_of_birth` (VARCHAR — formatted as DD/MM on public profiles)
- `avatar_url` (TEXT — path or Supabase Storage URL)
- `family_photo_url` (TEXT — path or Supabase Storage URL)
- `family_photo_approved` (BOOLEAN DEFAULT false)
- `has_spouse` (BOOLEAN DEFAULT false)
- `spouse_name` (VARCHAR)
- `spouse_dob` (VARCHAR — formatted as DD/MM on public profiles)
- `wedding_anniversary` (VARCHAR — formatted as DD/MM on public profiles)
- `children_data` (JSONB DEFAULT `'[]'::jsonb` — structured `{ name, dob }` array)
- `children_names` (TEXT — comma-delimited fallback)
- `address_in_india` (TEXT — full multiline address)
- `address_in_india_visible` (BOOLEAN DEFAULT false — public address visibility toggle)
- `family_message` (TEXT — custom warm message from family)
- `family_message_approved` (BOOLEAN DEFAULT false)
- `family_details_approved` (BOOLEAN DEFAULT false)
- `joining_date` (DATE DEFAULT `'2026-07-01'`)
- `status` (VARCHAR DEFAULT `'active'`, `'archived'`)
- `is_public` (BOOLEAN DEFAULT true)
- `display_order` (INTEGER DEFAULT 0)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2.2 Member Children (`member_children`)
- `id` (UUID PK, default `uuid_generate_v4()`)
- `member_id` (UUID NOT NULL, REFERENCES `members(id)` ON DELETE CASCADE)
- `full_name` (VARCHAR NOT NULL)
- `date_of_birth` (VARCHAR)
- `display_order` (INTEGER DEFAULT 0)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2.3 Leadership Assignments (`leadership_assignments`)
- `id` (UUID PK)
- `member_id` (UUID NOT NULL REFERENCES `members(id)` ON DELETE CASCADE)
- `lions_year` (VARCHAR DEFAULT `'2026–2027'`)
- `term_start_year` (INTEGER DEFAULT 2026)
- `term_end_year` (INTEGER DEFAULT 2027)
- `position_title` (VARCHAR NOT NULL)
- `primary_position` (VARCHAR: `'president'`, `'secretary'`, `'treasurer'`, `'ipp'`, `'none'`)
- `leader_message` (TEXT)
- `priority_order` (INTEGER DEFAULT 0)
- `is_active` (BOOLEAN DEFAULT true)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2.4 Contact Enquiries (`contact_enquiries`)
- `id` (UUID PK)
- `full_name` (VARCHAR NOT NULL)
- `email` (VARCHAR NOT NULL)
- `phone` (VARCHAR NOT NULL)
- `enquiry_type` (VARCHAR NOT NULL)
- `message` (TEXT NOT NULL)
- `status` (VARCHAR DEFAULT `'new'`, `'in_progress'`, `'resolved'`, `'archived'`)
- `is_read` (BOOLEAN DEFAULT false)
- `internal_notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

---

## 3. Database Setup Options

### Option A (Recommended): One-Click Master Setup Script
For a fresh project or clean setup, run the consolidated script in your **Supabase Dashboard &rarr; SQL Editor**:
- **Script:** [`supabase/setup_complete.sql`](file:///Users/alfinmathew/Desktop/LIONS/supabase/setup_complete.sql)
- **What it does in 1 execution:**
  1. Creates all 12 relational tables (`user_roles`, `members`, `member_children`, `leadership_assignments`, `projects`, `news_articles`, `events`, `gallery_albums`, `gallery_images`, `contact_enquiries`, `site_settings`, `impact_metrics`).
  2. Applies all Row Level Security (RLS) policies and helper security functions (`auth_is_admin()`, `auth_is_editor_or_admin()`).
  3. Creates `public.public_members` server-side privacy view masking private addresses and unapproved family data.
  4. Creates 10 performance indexes for lightning-fast queries.
  5. Provisions `club-media` (public) and `club-private` (private) storage buckets with staff-only role-based upload policies.
  6. Seeds legitimate baseline settings (motto: WE SERVE, name prefixes). Zero fake members or events are seeded.

### Option B: Incremental Migration Sequence
If executing scripts individually, run them in strict sequence in Supabase SQL Editor:
1. **`supabase/schema.sql`** — Base schema: extensions, enums, core tables.
2. **`supabase/policies.sql`** — Row Level Security policies, storage bucket configuration, and security functions.
3. **`supabase/migrations/20261014000007_member_management_enhancements.sql`** — Member management enhancements (date of birth, address in India, and relational member children).
4. **`supabase/migrations/20261014000008_public_members_privacy_view.sql`** — Server-side public members privacy view and column masking.
5. **`supabase/seed.sql`** — Baseline seed data for name prefixes and site settings.

---

## 4. Storage Bucket Configuration

The `club-media` bucket is configured automatically by `setup_complete.sql` (or `supabase/policies.sql`). If you prefer manual setup in the Supabase Dashboard:
1. In Supabase Dashboard &rarr; **Storage** &rarr; Create Bucket:
   - Name: `club-media`
   - Public: **Yes** (required for serving approved images)
2. Permitted folder structure:
   - `members/` — Individual member portraits
   - `family/` — Family photographs
   - `news/` — Editorial cover banners
   - `events/` — Event promotional photography
   - `projects/` — Service project covers
   - `gallery/` — Club media gallery
3. Storage Access Policies:
   - **SELECT (Read):** Public access to all files (`bucket_id = 'club-media'`).
   - **INSERT / UPDATE / DELETE (Write):** Authenticated staff only (`bucket_id = 'club-media' AND auth.role() = 'authenticated'`).

---

## 5. Environment Variables & Frontend Configuration

The project is pre-configured with the live Supabase credentials in `.env` and `js/config.js`:
```javascript
export const APP_CONFIG = {
  clubName: 'Dubai Oasis Lions Club',
  theme: 'We Serve',
  motto: 'We Serve',
  lionsYear: '2026–2027',
  storageBucket: 'club-media',
  supabaseUrl: 'https://ddmbxqabgfqviedayifo.supabase.co',
  supabaseAnonKey: 'sb_publishable_RXF5jbVR8qLuCF2aYmq-Ag_IWGWDu9-'
};
```
> [!IMPORTANT]
> The publishable anon key is safe for client-side use in browsers. Service-role keys, database passwords, and privileged credentials are NEVER committed or exposed to frontend code.

---

## 6. Admin Account Provisioning (Supabase Auth)

1. Go to **Authentication &rarr; Users** in your Supabase Dashboard (`https://supabase.com/dashboard/project/ddmbxqabgfqviedayifo/auth/users`).
2. Click **Add User** &rarr; **Create User**:
   - Email: `admin@dubaioasislions.org` (or your preferred admin email)
   - Password: Choose a secure password
   - Auto Confirm User: Checked
3. Copy the generated User ID (`UUID`).
4. In **SQL Editor**, run the following command to grant administrative privileges:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<PASTE-COPIED-USER-UUID-HERE>', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```
5. You can now log into `/admin/index.html` using the email and password you created.

---

## 7. Verification & Health Check

Run the integration and site regression suites locally via terminal:
```bash
# Verify complete Supabase integration (schema, policies, seed, uploads, and config)
node tests/test-supabase-integration.js

# Verify all 16 site QA and regression checks
node tests/verify-site.js

# Verify member management and family privacy gating
node tests/test-complete-member-integration.js
```
