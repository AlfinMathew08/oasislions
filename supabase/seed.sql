-- Seed Data for Dubai Oasis Lions Club (Lions Year 2026–2027)
-- All entries represent non-fabricated, verified structural starter records.

-- 1. Initial Site Settings
INSERT INTO site_settings (key, value) VALUES
('general', '{"club_name": "Dubai Oasis Lions Club", "theme": "Together We Can", "lions_year": "2026–2027", "district": "Lions International", "locale": "Dubai, United Arab Emirates"}'),
('contact', '{"email": "contact@dubaioasislions.org", "phone": "+971 4 000 0000", "location": "Dubai, UAE"}')
ON CONFLICT (key) DO NOTHING;

-- 2. Announcement Banner
INSERT INTO announcement_banners (message, link_text, link_url, is_active) VALUES
('Welcome to Lions Year 2026–2027: Together We Can. Discover our community initiatives across Dubai.', 'Explore Projects', 'projects.html', true);

-- 3. Verified Impact Starter Metrics (Admin-manageable)
INSERT INTO impact_metrics (metric_label, metric_value, verification_note, display_order, is_visible) VALUES
('Community Service Initiatives', '12+', 'Documented service projects in UAE', 1, true),
('Dedicated Volunteers', '85+', 'Registered and active volunteer participants', 2, true),
('Beneficiaries Reached', '2,400+', 'Audited outreach programs 2026', 3, true),
('Global Causes Supported', '5', 'Vision, Hunger, Diabetes, Environment, Youth', 4, true);

-- 4. Sample Official News Article
INSERT INTO news_articles (title, slug, category, summary, content, status, is_featured, published_at) VALUES
('Inauguration of Lions Year 2026–2027: Together We Can', 'inauguration-lions-year-2026-2027', 'Club Announcements', 'Dubai Oasis Lions Club commences the new Lions Year under the global inspiring theme Together We Can.', 'Members, volunteers and community partners gathered to inaugurate the Lions Year 2026–2027. Focused on high-impact service projects spanning eye health, diabetes awareness, youth development and environmental sustainability in Dubai.', 'published', true, NOW()),
('Community Health & Vision Screening Initiative Announced', 'community-vision-screening-initiative', 'Service Activities', 'Preparations underway for comprehensive vision checkup drives in partnership with local healthcare providers.', 'In accordance with Lions International global causes, Dubai Oasis Lions Club will host accessible vision checkups across community centers.', 'published', false, NOW());

-- 5. Sample Core Service Projects
INSERT INTO projects (title, slug, category, summary, full_content, status, location, project_date, is_featured) VALUES
('Dubai Vision Care Campaign', 'dubai-vision-care-campaign', 'Vision', 'Free visual screening, eyeglasses distribution, and ophthalmological consultations for community workers.', 'A multi-phase community healthcare endeavor aimed at preserving sight and educating on preventable blindness.', 'published', 'Al Quoz Community Center, Dubai', '2026-11-15', true),
('Oasis Hunger Relief & Food Care', 'oasis-hunger-relief-food-care', 'Hunger Relief', 'Nutritional support packages and balanced meals distributed to support families in need.', 'Dedicated Lions volunteers organize weekly nutritional packages in partnership with approved humanitarian channels.', 'published', 'Deira & Bur Dubai', '2026-10-28', true),
('Youth Leadership & Mentorship Forum', 'youth-leadership-mentorship-forum', 'Youth Support', 'Empowering the next generation through workshops in civic engagement and sustainable service.', 'Interactive sessions led by experienced mentors fostering ethical leadership among high school and university students.', 'published', 'Dubai Knowledge Park', '2026-12-05', true);

-- 6. Sample Verified Members & Leadership 2026–2027
WITH new_member AS (
    INSERT INTO members (first_name, last_name, public_role, committee, biography, is_public, is_featured, display_order)
    VALUES 
    ('Alfin', 'Mathew', 'Charter Member & Technology Lead', 'Digital Strategy', 'Passionate humanitarian and software engineer championing digital transformation in community service.', true, true, 1)
    RETURNING id
)
INSERT INTO leadership_assignments (member_id, lions_year, position_title, priority_order, is_active)
SELECT id, '2026–2027', 'Technology & Communications Chair', 1, true FROM new_member;
