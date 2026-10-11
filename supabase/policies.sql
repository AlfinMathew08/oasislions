-- Row Level Security (RLS) Policies
-- Dubai Oasis Lions Club

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leadership_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_banners ENABLE ROW LEVEL SECURITY;

-- Helper Function to check role safely
CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION auth_is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. user_roles: only admins can view and manage
CREATE POLICY "Admins can view and manage user roles"
ON user_roles FOR ALL
USING (auth_is_admin())
WITH CHECK (auth_is_admin());

-- Users can read their own role
CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 2. members: public reads only approved public profiles; editors/admins full access
CREATE POLICY "Public can view active public members"
ON members FOR SELECT
USING (is_public = true);

CREATE POLICY "Staff can manage members"
ON members FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- 3. leadership_assignments
CREATE POLICY "Public can view active leadership"
ON leadership_assignments FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff can manage leadership"
ON leadership_assignments FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- 4. projects: public reads only published projects
CREATE POLICY "Public can view published projects"
ON projects FOR SELECT
USING (status = 'published');

CREATE POLICY "Staff can manage projects"
ON projects FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- 5. news_articles: public reads published articles
CREATE POLICY "Public can view published news"
ON news_articles FOR SELECT
USING (status = 'published');

CREATE POLICY "Staff can manage news"
ON news_articles FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- 6. events: public reads published events
CREATE POLICY "Public can view published events"
ON events FOR SELECT
USING (status = 'published');

CREATE POLICY "Staff can manage events"
ON events FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- 7. gallery_albums & gallery_images: public reads public albums & approved images
CREATE POLICY "Public can view public albums"
ON gallery_albums FOR SELECT
USING (is_public = true);

CREATE POLICY "Staff can manage albums"
ON gallery_albums FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

CREATE POLICY "Public can view approved gallery images"
ON gallery_images FOR SELECT
USING (is_approved = true);

CREATE POLICY "Staff can manage gallery images"
ON gallery_images FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- 8. contact_enquiries: Anonymous can INSERT only; Never SELECT/UPDATE
CREATE POLICY "Public can submit contact enquiries"
ON contact_enquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Staff can view and manage enquiries"
ON contact_enquiries FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

-- 9. site_settings & impact_metrics & announcement_banners
CREATE POLICY "Public can read site settings"
ON site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site settings"
ON site_settings FOR ALL
USING (auth_is_admin())
WITH CHECK (auth_is_admin());

CREATE POLICY "Public can view verified impact metrics"
ON impact_metrics FOR SELECT
USING (is_visible = true);

CREATE POLICY "Staff can manage impact metrics"
ON impact_metrics FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());

CREATE POLICY "Public can read active announcement banners"
ON announcement_banners FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff can manage announcement banners"
ON announcement_banners FOR ALL
USING (auth_is_editor_or_admin())
WITH CHECK (auth_is_editor_or_admin());
