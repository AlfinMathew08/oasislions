-- Dubai Oasis Lions Club — Lions Year 2026–2027
-- Database Schema for Supabase PostgreSQL
-- Enforces UUIDs, Constraints, Foreign Keys & Updated Triggers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Roles & Admin Authorization
CREATE TYPE user_role_type AS ENUM ('admin', 'editor');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'editor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id)
);

-- 2. Members Directory
CREATE TABLE members (
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
CREATE TABLE member_children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Leadership Assignments (Year Specific, e.g. 2026-2027)
CREATE TABLE leadership_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
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
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE projects (
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
CREATE TABLE news_articles (
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
CREATE TABLE name_prefixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prefix VARCHAR(50) NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Events
CREATE TABLE events (
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
CREATE TABLE gallery_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES gallery_albums(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    alt_text VARCHAR(255),
    is_approved BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. Contact Enquiries (Private Inbox)
CREATE TYPE enquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'archived');

CREATE TABLE contact_enquiries (
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
CREATE TABLE site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE impact_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_label VARCHAR(100) NOT NULL,
    metric_value VARCHAR(50) NOT NULL,
    verification_note TEXT,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true
);

-- 10. Announcement Banners
CREATE TABLE announcement_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    link_url TEXT,
    link_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Automatic Timestamp Updater Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_modtime BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_news_modtime BEFORE UPDATE ON news_articles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_events_modtime BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_enquiries_modtime BEFORE UPDATE ON contact_enquiries FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 11. Performance & Relationship Indexes
CREATE INDEX IF NOT EXISTS idx_members_public_status ON members(is_public, status);
CREATE INDEX IF NOT EXISTS idx_members_display_order ON members(display_order);
CREATE INDEX IF NOT EXISTS idx_member_children_member_id ON member_children(member_id);
CREATE INDEX IF NOT EXISTS idx_leadership_active_priority ON leadership_assignments(is_active, priority_order);
CREATE INDEX IF NOT EXISTS idx_leadership_member_id ON leadership_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_news_status_published ON news_articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status_start ON events(status, start_time ASC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON contact_enquiries(status, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album ON gallery_images(album_id, is_approved);

