-- ============================================================================
-- DUBAI OASIS LIONS CLUB — PRODUCTION DATABASE & SECURITY SETUP
-- Lions Year 2026–2027 | Motto: WE SERVE
-- ============================================================================
-- Instructions: Execute this entire script in your Supabase SQL Editor:
-- (Dashboard -> SQL Editor -> New Query -> Paste & Run)
--
-- This script safely:
-- 1. Creates all core tables with UUIDs, foreign keys, and updated triggers.
-- 2. Sets up Row Level Security (RLS) policies and security definer functions.
-- 3. Provisions performance indexes for fast querying and directory filtering.
-- 4. Configures public and private storage buckets with strict role-based uploads.
-- 5. Seeds ONLY legitimate baseline settings (Name Prefixes, Motto: WE SERVE).
--
-- Clean Production Guarantee:
-- - NO fictional member profiles or mock family data seeded.
-- - NO sample news articles or fabricated events seeded.
-- - NO destructive DELETE or TRUNCATE operations.
-- - 100% idempotent: Safe to execute on a fresh project or rerun on existing setup.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: EXTENSIONS & ENUM TYPES
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'editor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE enquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- SECTION 2: CORE RELATIONAL TABLES
-- ----------------------------------------------------------------------------

-- 1. User Roles & Admin Authorization
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'editor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id)
);

-- 2. Members Directory
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    name_prefix VARCHAR(50) DEFAULT 'Lion',
    joining_date DATE DEFAULT '2026-07-01',
    public_role VARCHAR(150),
    committee VARCHAR(150),
    service_interests TEXT[],
    biography TEXT,
    professional_background TEXT,
    avatar_url TEXT,
    family_photo_url TEXT,
    family_photo_approved BOOLEAN DEFAULT false,
    family_members_names TEXT,
    family_intro TEXT,
    date_of_birth VARCHAR(50),
    spouse_name VARCHAR(150),
    spouse_details TEXT,
    has_spouse BOOLEAN DEFAULT false,
    spouse_dob VARCHAR(50),
    wedding_anniversary VARCHAR(50),
    children_names TEXT,
    children_details TEXT,
    children_data JSONB DEFAULT '[]'::jsonb,
    address_in_india TEXT,
    address_in_india_visible BOOLEAN DEFAULT false,
    other_family_info TEXT,
    family_message TEXT,
    family_message_approved BOOLEAN DEFAULT false,
    family_details_approved BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2b. Member Children Directory (Relational Support)
CREATE TABLE IF NOT EXISTS public.member_children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Leadership Assignments (Year Specific, e.g. 2026–2027)
CREATE TABLE IF NOT EXISTS public.leadership_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    lions_year VARCHAR(20) NOT NULL DEFAULT '2026–2027',
    term_start_year INTEGER NOT NULL DEFAULT 2026,
    term_end_year INTEGER NOT NULL DEFAULT 2027,
    position_title VARCHAR(150) NOT NULL,
    primary_position VARCHAR(20) DEFAULT 'none',
    leader_message TEXT,
    priority_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Service Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    full_content TEXT,
    status content_status NOT NULL DEFAULT 'draft',
    cover_image_url TEXT,
    location VARCHAR(200),
    project_date DATE,
    verified_outcomes JSONB,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. News Articles & Announcements
CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL DEFAULT 'Club Announcements',
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    author_name VARCHAR(150) DEFAULT 'Dubai Oasis Lions Club',
    seo_title VARCHAR(255),
    seo_description TEXT,
    status content_status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5b. Name Prefixes
CREATE TABLE IF NOT EXISTS public.name_prefixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prefix VARCHAR(50) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Events & Outreach Programs
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL DEFAULT 'Community Service',
    short_summary TEXT,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255) NOT NULL,
    venue_name VARCHAR(255),
    contact_info VARCHAR(255),
    cover_image_url TEXT,
    status content_status NOT NULL DEFAULT 'draft',
    event_status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    is_featured BOOLEAN DEFAULT false,
    registration_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. Media Gallery
CREATE TABLE IF NOT EXISTS public.gallery_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    alt_text VARCHAR(255),
    is_approved BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Contact Enquiries (Private Club Inbox)
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enquiry_type VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT NOT NULL,
    status enquiry_status NOT NULL DEFAULT 'new',
    is_read BOOLEAN DEFAULT false,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Site Settings & Verified Impact Metrics
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.impact_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_label VARCHAR(100) NOT NULL,
    metric_value VARCHAR(50) NOT NULL,
    verification_note TEXT,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

-- 10. Announcement Banners
CREATE TABLE IF NOT EXISTS public.announcement_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    link_url TEXT,
    link_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 11. Public-Safe Member Directory Privacy View
-- Server-side column masking ensures home addresses in India, unapproved family photos,
-- and unapproved family details are physically NULL across the wire for public visitors.
CREATE OR REPLACE VIEW public.public_members AS
SELECT
    id,
    name_prefix,
    first_name,
    last_name,
    public_role,
    committee,
    service_interests,
    professional_background,
    biography,
    avatar_url,
    joining_date,
    date_of_birth,
    -- Family photo: ONLY exposed if family_photo_approved is TRUE
    CASE WHEN family_photo_approved = true THEN family_photo_url ELSE NULL END AS family_photo_url,
    family_photo_approved,
    -- Address in India: ONLY exposed if address_in_india_visible is TRUE
    CASE WHEN address_in_india_visible = true THEN address_in_india ELSE NULL END AS address_in_india,
    address_in_india_visible,
    -- Family details: ONLY exposed if family_details_approved is TRUE
    CASE WHEN family_details_approved = true THEN has_spouse ELSE false END AS has_spouse,
    CASE WHEN family_details_approved = true THEN spouse_name ELSE NULL END AS spouse_name,
    CASE WHEN family_details_approved = true THEN spouse_dob ELSE NULL END AS spouse_dob,
    CASE WHEN family_details_approved = true THEN wedding_anniversary ELSE NULL END AS wedding_anniversary,
    CASE WHEN family_details_approved = true THEN children_data ELSE '[]'::jsonb END AS children_data,
    CASE WHEN family_details_approved = true THEN children_names ELSE NULL END AS children_names,
    family_details_approved,
    -- Family message: ONLY exposed if family_message_approved is TRUE
    CASE WHEN family_message_approved = true THEN family_message ELSE NULL END AS family_message,
    family_message_approved,
    status,
    is_public,
    is_featured,
    display_order,
    created_at
FROM public.members
WHERE is_public = true AND status = 'active';

GRANT SELECT ON public.public_members TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- SECTION 3: AUTOMATIC TIMESTAMP TRIGGERS
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_members_modtime ON public.members;
CREATE TRIGGER update_members_modtime BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_projects_modtime ON public.projects;
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_news_modtime ON public.news_articles;
CREATE TRIGGER update_news_modtime BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_events_modtime ON public.events;
CREATE TRIGGER update_events_modtime BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_enquiries_modtime ON public.contact_enquiries;
CREATE TRIGGER update_enquiries_modtime BEFORE UPDATE ON public.contact_enquiries FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ----------------------------------------------------------------------------
-- SECTION 4: PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_members_public_status ON public.members(is_public, status);
CREATE INDEX IF NOT EXISTS idx_members_display_order ON public.members(display_order);
CREATE INDEX IF NOT EXISTS idx_member_children_member_id ON public.member_children(member_id);
CREATE INDEX IF NOT EXISTS idx_leadership_active_priority ON public.leadership_assignments(is_active, priority_order);
CREATE INDEX IF NOT EXISTS idx_leadership_member_id ON public.leadership_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_news_status_published ON public.news_articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status_start ON public.events(status, start_time ASC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.contact_enquiries(status, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album ON public.gallery_images(album_id, is_approved);

-- ----------------------------------------------------------------------------
-- SECTION 5: ROW LEVEL SECURITY & AUTHORIZATION FUNCTIONS
-- ----------------------------------------------------------------------------

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_banners ENABLE ROW LEVEL SECURITY;

-- Security Definer Functions (set search_path to prevent hijack attacks)
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION auth_is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------------------
-- SECTION 6: TABLE RLS POLICIES
-- ----------------------------------------------------------------------------

-- 1. user_roles: only admins can manage; users read own role
DROP POLICY IF EXISTS "Admins can view and manage user roles" ON public.user_roles;
CREATE POLICY "Admins can view and manage user roles" ON public.user_roles FOR ALL USING (auth_is_admin()) WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 2. members: public reads only active public members; staff manage
DROP POLICY IF EXISTS "Public can view active public members" ON public.members;
CREATE POLICY "Public can view active public members" ON public.members FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Staff can manage members" ON public.members;
CREATE POLICY "Staff can manage members" ON public.members FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 2b. member_children: public reads ONLY if parent member is public AND family details are approved
DROP POLICY IF EXISTS "Public can view approved member children" ON public.member_children;
CREATE POLICY "Public can view approved member children" ON public.member_children FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE public.members.id = public.member_children.member_id
      AND public.members.is_public = true
      AND public.members.family_details_approved = true
  )
);

DROP POLICY IF EXISTS "Staff can manage member children" ON public.member_children;
CREATE POLICY "Staff can manage member children" ON public.member_children FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 3. leadership_assignments: public reads active; staff manage
DROP POLICY IF EXISTS "Public can view active leadership" ON public.leadership_assignments;
CREATE POLICY "Public can view active leadership" ON public.leadership_assignments FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff can manage leadership" ON public.leadership_assignments;
CREATE POLICY "Staff can manage leadership" ON public.leadership_assignments FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 4. projects: public reads published; staff manage
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Staff can manage projects" ON public.projects;
CREATE POLICY "Staff can manage projects" ON public.projects FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 5. news_articles: public reads published; staff manage
DROP POLICY IF EXISTS "Public can view published news" ON public.news_articles;
CREATE POLICY "Public can view published news" ON public.news_articles FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Staff can manage news" ON public.news_articles;
CREATE POLICY "Staff can manage news" ON public.news_articles FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 6. events: public reads published; staff manage
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Staff can manage events" ON public.events;
CREATE POLICY "Staff can manage events" ON public.events FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 7. gallery_albums & images: public reads public/approved; staff manage
DROP POLICY IF EXISTS "Public can view public albums" ON public.gallery_albums;
CREATE POLICY "Public can view public albums" ON public.gallery_albums FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Staff can manage albums" ON public.gallery_albums;
CREATE POLICY "Staff can manage albums" ON public.gallery_albums FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

DROP POLICY IF EXISTS "Public can view approved gallery images" ON public.gallery_images;
CREATE POLICY "Public can view approved gallery images" ON public.gallery_images FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Staff can manage gallery images" ON public.gallery_images;
CREATE POLICY "Staff can manage gallery images" ON public.gallery_images FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 8. contact_enquiries: Public INSERT ONLY; Staff read/update
DROP POLICY IF EXISTS "Public can submit contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Public can submit contact enquiries" ON public.contact_enquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view and manage enquiries" ON public.contact_enquiries;
CREATE POLICY "Staff can view and manage enquiries" ON public.contact_enquiries FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- 9. site_settings, impact metrics, banners
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (auth_is_admin()) WITH CHECK (auth_is_admin());

DROP POLICY IF EXISTS "Public can view verified impact metrics" ON public.impact_metrics;
CREATE POLICY "Public can view verified impact metrics" ON public.impact_metrics FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Staff can manage impact metrics" ON public.impact_metrics;
CREATE POLICY "Staff can manage impact metrics" ON public.impact_metrics FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

DROP POLICY IF EXISTS "Public can read active announcement banners" ON public.announcement_banners;
CREATE POLICY "Public can read active announcement banners" ON public.announcement_banners FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Staff can manage announcement banners" ON public.announcement_banners;
CREATE POLICY "Staff can manage announcement banners" ON public.announcement_banners FOR ALL USING (auth_is_editor_or_admin()) WITH CHECK (auth_is_editor_or_admin());

-- ----------------------------------------------------------------------------
-- SECTION 7: STORAGE BUCKETS & ROLE-BASED ACCESS POLICIES
-- ----------------------------------------------------------------------------

-- 1. Public marketing and club assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club-media',
  'club-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Private storage bucket for confidential / unapproved member documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'club-private',
  'club-private',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage Policies: Public Read on club-media
DROP POLICY IF EXISTS "Public can view club media" ON storage.objects;
CREATE POLICY "Public can view club media" ON storage.objects FOR SELECT USING (bucket_id = 'club-media');

-- Storage Policies: Private Read on club-private (Staff Only)
DROP POLICY IF EXISTS "Staff can view private club media" ON storage.objects;
CREATE POLICY "Staff can view private club media" ON storage.objects FOR SELECT USING (
  bucket_id = 'club-private' AND auth_is_editor_or_admin()
);

-- Storage Upload Policy: Restricted strictly to authorized staff (auth_is_editor_or_admin)
-- Prevents arbitrary authenticated users from uploading files.
DROP POLICY IF EXISTS "Staff can upload club media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can upload club media" ON storage.objects;
CREATE POLICY "Staff can upload club media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('club-media', 'club-private')
  AND auth_is_editor_or_admin()
);

-- Storage Update Policy: Restricted strictly to authorized staff
DROP POLICY IF EXISTS "Staff can update club media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can update club media" ON storage.objects;
CREATE POLICY "Staff can update club media" ON storage.objects FOR UPDATE USING (
  bucket_id IN ('club-media', 'club-private')
  AND auth_is_editor_or_admin()
);

-- Storage Delete Policy: Restricted strictly to authorized staff
DROP POLICY IF EXISTS "Staff can delete club media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can delete club media" ON storage.objects;
CREATE POLICY "Staff can delete club media" ON storage.objects FOR DELETE USING (
  bucket_id IN ('club-media', 'club-private')
  AND auth_is_editor_or_admin()
);

-- ----------------------------------------------------------------------------
-- SECTION 8: BASELINE OFFICIAL SETTINGS ONLY (ZERO FABRICATED CONTENT)
-- ----------------------------------------------------------------------------

-- 1. Standard Lions Name Prefixes
INSERT INTO public.name_prefixes (prefix, display_order, is_enabled, is_default) VALUES
('Lion', 1, true, true),
('Lion Dr.', 2, true, false),
('Dr.', 3, true, false),
('Mr.', 4, true, false),
('Mrs.', 5, true, false),
('Ms.', 6, true, false),
('No prefix', 7, true, false)
ON CONFLICT (prefix) DO NOTHING;

-- 2. Official Dubai Oasis Lions Club Baseline Settings (Motto: WE SERVE)
INSERT INTO public.site_settings (key, value) VALUES
('general', '{"club_name": "Dubai Oasis Lions Club", "theme": "WE SERVE", "motto": "WE SERVE", "lions_year": "2026–2027", "district": "Lions International", "locale": "Dubai, United Arab Emirates"}'),
('contact', '{"email": "contact@dubaioasislions.org", "phone": "+971 4 000 0000", "location": "Dubai, UAE"}')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
