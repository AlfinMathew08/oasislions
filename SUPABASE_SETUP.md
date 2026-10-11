# Supabase Complete Setup Guide
**Dubai Oasis Lions Club — Lions Year 2026–2027**
Theme: *Together We Can.*

---

## 1. Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com).
2. Click **New Project**.
3. Choose an organization, enter Project Name (e.g., `Dubai-Oasis-Lions-Club`), set a secure Database Password, and select the region closest to Dubai (e.g., `Middle East (UAE / Bahrain)` or `Central EU`).

---

## 2. Execute SQL Database Scripts in Exact Sequence
Open the **SQL Editor** in your Supabase dashboard and execute the scripts in the following order:

1. **`supabase/schema.sql`**
   - Enables UUID extension.
   - Sets up custom enumerations (`user_role_type`, `content_status`, `enquiry_status`).
   - Creates the 10 core tables (`user_roles`, `members`, `leadership_assignments`, `projects`, `news_articles`, `events`, `gallery_albums`, `gallery_images`, `contact_enquiries`, `site_settings`, `impact_metrics`, `announcement_banners`).
   - Attaches `update_modified_column()` triggers.

2. **`supabase/policies.sql`**
   - Enables Row Level Security (RLS) across all tables.
   - Defines `auth_is_admin()` and `auth_is_editor_or_admin()` security helper functions with safe search path.
   - Restricts anonymous access to **ONLY** published, approved public content.
   - Restricts `contact_enquiries` so anonymous users can **INSERT only**; reads and updates are strictly guarded for authenticated administrators/editors.

3. **`supabase/seed.sql`**
   - Populates initial site settings, announcement banners, and starter non-fabricated records.

---

## 3. Configure Supabase Storage Bucket
1. Navigate to **Storage** in the left sidebar.
2. Click **New Bucket**.
3. Bucket Name: `club-media`.
4. Check **Public Bucket** (required for serving approved photos publicly).
5. Click **Save Bucket**.
6. Set Storage Policies:
   - Allow public read (`SELECT`) to everyone.
   - Allow write (`INSERT`, `UPDATE`, `DELETE`) only to authenticated users.

---

## 4. Bootstrapping Your First Administrator
1. Go to **Authentication > Users**.
2. Click **Add User** -> **Create User**.
3. Enter your administrator email and a strong password. Confirm email automatically.
4. Copy the newly created user's **UID**.
5. In **SQL Editor**, run:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<PASTE-YOUR-COPIED-UID>', 'admin');
   ```
6. You can now log in at `/admin/login.html` with full administrative privileges.

---

## 5. Connecting Frontend to Supabase
In `js/config.js`, configure your project credentials:
```javascript
export const APP_CONFIG = {
  clubName: 'Dubai Oasis Lions Club',
  theme: 'Together We Can',
  lionsYear: '2026–2027',
  storageBucket: 'club-media',
  supabaseUrl: 'https://<your-project-ref>.supabase.co',
  supabaseAnonKey: '<your-anon-publishable-key>'
};
```
*Note: The anon key is safe for client-side usage because Row Level Security (RLS) protects the database.*
