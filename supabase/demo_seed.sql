-- ============================================================================
-- DUBAI OASIS LIONS CLUB — OPTIONAL DEMONSTRATION / LOCAL PREVIEW SEED DATA
-- Lions Year 2026–2027 | Motto: WE SERVE
-- ============================================================================
-- WARNING: THIS SCRIPT CONTAINS DEMONSTRATION / MOCK DATA DESIGNED FOR
-- LOCAL UI MODELING AND STAGING PREVIEWS ONLY.
--
-- DO NOT EXECUTE THIS SCRIPT IN YOUR PRODUCTION SUPABASE DATABASE.
-- For production setup, run ONLY `supabase/setup_complete.sql`.
-- ============================================================================

-- 1. Demo Announcement Banner
INSERT INTO public.announcement_banners (message, link_text, link_url, is_active) VALUES
('Welcome to Lions Year 2026–2027: WE SERVE. Discover our humanitarian initiatives across Dubai.', 'Explore Projects', 'projects.html', true)
ON CONFLICT DO NOTHING;

-- 2. Demo Impact Metrics
INSERT INTO public.impact_metrics (metric_label, metric_value, verification_note, display_order, is_visible) VALUES
('Community Service Initiatives', '12+', 'Documented service projects in UAE', 1, true),
('Dedicated Volunteers', '85+', 'Registered and active volunteer participants', 2, true),
('Beneficiaries Reached', '2,400+', 'Audited outreach programs 2026', 3, true),
('Global Causes Supported', '5', 'Vision, Hunger, Diabetes, Environment, Youth', 4, true)
ON CONFLICT DO NOTHING;

-- 3. Demo Service Projects
INSERT INTO public.projects (title, slug, category, summary, full_content, status, location, project_date, is_featured, cover_image_url) VALUES
('Dubai Vision Care Campaign', 'dubai-vision-care-campaign', 'Vision', 'Free visual screening, eyeglasses distribution, and ophthalmological consultations for community workers.', 'In alignment with Lions Clubs International landmark sight conservation mission, the Dubai Vision Care Campaign provides essential diagnostic eye examinations, prescription spectacles, and referrals for workers and community members across Dubai.', 'published', 'Al Quoz Community Center, Dubai', '2026-11-15', true, 'assets/images/project-vision.jpg'),
('Oasis Hunger Relief & Food Care', 'oasis-hunger-relief-food-care', 'Hunger Relief', 'Nutritional support packages and balanced meals distributed to support families in need.', 'Direct humanitarian relief ensuring dignified nutrition assistance through structured distribution drives organized by dedicated Lions volunteers across Deira and Bur Dubai.', 'published', 'Deira & Bur Dubai', '2026-10-28', true, 'assets/images/project-food.jpg'),
('Youth Leadership & Mentorship Forum', 'youth-leadership-mentorship-forum', 'Youth Support', 'Empowering the next generation through workshops in civic engagement and sustainable service.', 'Interactive sessions led by experienced mentors fostering ethical leadership, teamwork, and compassionate civic responsibility among university and high school students.', 'published', 'Dubai Knowledge Park', '2026-12-05', true, 'assets/images/project-youth.jpg')
ON CONFLICT (slug) DO NOTHING;

-- 4. Demo Editorial News Articles
INSERT INTO public.news_articles (title, slug, category, summary, content, status, is_featured, published_at, cover_image_url) VALUES
('Inauguration of Lions Year 2026–2027: WE SERVE', 'inauguration-lions-year-2026-2027', 'Club Announcements', 'Dubai Oasis Lions Club commences the new Lions Year under the global motto WE SERVE.', 'Members, volunteers, and community partners convened to inaugurate the Lions Year 2026–2027. Focused on high-impact service projects spanning eye health, diabetes awareness, youth development, and environmental sustainability in Dubai.', 'published', true, NOW(), 'assets/images/hero-service.jpg'),
('Community Health & Vision Screening Initiative Announced', 'community-vision-screening-initiative', 'Service Activities', 'Preparations underway for comprehensive vision checkup drives in partnership with local healthcare providers.', 'In accordance with Lions International global causes, Dubai Oasis Lions Club will host accessible vision checkups across community centers in Dubai.', 'published', false, NOW(), 'assets/images/project-vision.jpg'),
('Youth Leadership & Mentorship Forum Opens Registration', 'youth-leadership-forum-2026', 'Community News', 'Empowering upcoming student leaders through mentorship, teamwork exercises, and ethical civic problem-solving.', 'A workshop series dedicated to inspiring high school and university students to become active contributors to societal development through ethical leadership and civic service.', 'published', false, NOW(), 'assets/images/project-youth.jpg')
ON CONFLICT (slug) DO NOTHING;

-- 5. Demo Upcoming Events
INSERT INTO public.events (title, slug, category, short_summary, description, start_time, end_time, location, venue_name, contact_info, cover_image_url, status, event_status, is_featured, registration_url, published_at) VALUES
('Annual Community Vision Care Drive', 'annual-vision-care-drive', 'Vision Care', 'Free comprehensive eye examinations, diagnostic screening, and corrective eyewear support for community workers across Dubai.', 'In alignment with Lions Clubs International landmark sight conservation mission, Dubai Oasis Lions Club organizes this comprehensive eye health clinic offering free visual acuity exams, refractive error evaluations, intraocular pressure screening, and distribution of prescription spectacles.', '2026-11-15 09:00:00+04', '2026-11-15 17:00:00+04', 'Al Quoz Community Center, Dubai', 'Al Quoz Community Hall 2', 'events@dubaioasislions.org', 'assets/images/project-vision.jpg', 'published', 'scheduled', true, 'contact.html?subject=Vision+Drive+Registration', NOW()),
('Dubai Oasis Environmental Clean-up & Planting Day', 'environmental-cleanup-planting', 'Environment', 'Conserving local desert ecosystems and planting indigenous ghaf saplings in collaboration with environmental partners.', 'Join fellow Lions and community volunteers in protecting native flora and fauna at the Al Qudra nature preserve. Activities include guided desert perimeter clean-up, conservation educational briefings, and planting drought-resilient ghaf trees.', '2026-12-05 08:00:00+04', '2026-12-05 13:00:00+04', 'Al Qudra Lakes Reserve, Dubai', 'Al Qudra Eco Visitor Station', 'eco@dubaioasislions.org', 'assets/images/project-eco.jpg', 'published', 'scheduled', true, 'contact.html?subject=Eco+Clean-up+Registration', NOW()),
('Youth Leadership & Mentorship Summit', 'youth-leadership-mentorship-summit', 'Youth Support', 'Interactive seminar empowering university and high school scholars with ethical leadership and civic engagement skills.', 'A full-day interactive forum featuring leadership workshops, team problem-solving challenges, and mentoring sessions facilitated by experienced Lions and civic mentors. Participants receive certificates of participation.', '2026-12-18 10:00:00+04', '2026-12-18 16:00:00+04', 'Dubai Knowledge Park, Dubai', 'Conference Auditorium Block 2', 'youth@dubaioasislions.org', 'assets/images/project-youth.jpg', 'published', 'scheduled', false, 'contact.html?subject=Youth+Summit+Registration', NOW()),
('Community Nutritional Outreach & Food Care Assembly', 'nutritional-outreach-food-care', 'Hunger Relief', 'Assembling and distributing essential nutritional packages to assist vulnerable families and service workers.', 'Our quarterly hunger relief drive brings together club volunteers and partner organizations to package dry rations, healthy essentials, and fresh produce packages for dignified community delivery.', '2027-01-20 09:30:00+04', '2027-01-20 14:30:00+04', 'Deira Community Hall, Dubai', 'Deira Civic Complex', 'care@dubaioasislions.org', 'assets/images/project-food.jpg', 'published', 'scheduled', false, 'contact.html?subject=Nutritional+Outreach+Registration', NOW()),
('Diabetes Awareness & Wellness Walk', 'diabetes-awareness-wellness-walk', 'Health & Wellness', 'Community wellness walk and free blood glucose screening to advocate early detection and healthy living habits.', 'Supporting the global Lions battle against diabetes through proactive community screening, lifestyle counseling, and an inspiring family-friendly 3km wellness walk around Dubai Creek Park.', '2027-02-14 08:30:00+04', '2027-02-14 12:00:00+04', 'Creek Park Gate 2, Dubai', 'Creek Park Amphitheatre', 'wellness@dubaioasislions.org', 'assets/images/hero-service.jpg', 'published', 'scheduled', false, 'contact.html?subject=Wellness+Walk+Registration', NOW())
ON CONFLICT (slug) DO NOTHING;
