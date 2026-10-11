# Supabase Configuration & Architecture Guide
**Dubai Oasis Lions Club — Lions Year 2026–2027**

## 1. Overview
The database backend runs on Supabase PostgreSQL, leveraging:
- PostgreSQL Row Level Security (RLS) policies.
- Role-based permissions (`admin`, `editor`, and public anonymous visitors).
- Storage buckets for public approved website media and private documents.
- Strongly-typed schemas with UUID keys, updated triggers, and relations.

## 2. SQL Scripts Execution Order
Run the scripts in Supabase SQL Editor in this exact order:

1. `schema.sql`: Sets up extensions, enumerations, tables, constraints, foreign keys, and triggers.
2. `policies.sql`: Enables RLS and attaches public access restrictions and admin guards.
3. `seed.sql`: Populates starter site settings, announcement banners, initial impact metrics, and non-fabricated baseline records.

## 3. Storage Buckets Setup
1. Go to **Supabase Dashboard > Storage**.
2. Create a new bucket named: `club-media`.
3. Set bucket to **Public** for approved website photographs.
4. Add the following Storage Policy:
   - **SELECT**: Allow public access (`true`).
   - **INSERT / UPDATE / DELETE**: Allow authenticated users with admin/editor role (`auth.role() = 'authenticated'`).

## 4. Bootstrapping Initial Administrator
To securely create your first administrator:
1. Go to **Supabase Dashboard > Authentication > Users**.
2. Click **Add User** and create an account with your administrator email and a strong password.
3. Copy the generated User UID.
4. Run this query in **SQL Editor**:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<YOUR_USER_UID>', 'admin');
   ```
5. You can now log in at `/admin/login.html` with full administrator rights.
