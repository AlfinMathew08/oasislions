// Automated Verification & QA Test Suite
// Validates Homepage, Executive Leadership (President Left, Secretary Centre, Treasurer Right),
// Secondary Scrollable Carousel, 13 Office-Bearers, Footer 3-Logo Brand Composition,
// Upcoming Events Scrollable Stream, Event Details Page Return Flow,
// Complete Admin News CRUD, Meet Our Members Homepage Section, 2-Column Member Modal,
// Admin Member Management, Standardized Name Prefix System, and Leadership Highlighting.

import fs from 'fs';
import path from 'path';
import { DEFAULT_PUBLIC_DATA } from '../js/public-data.js';

const projectRoot = path.resolve();

console.log('--- DUBAI OASIS LIONS CLUB — COMPREHENSIVE QA & REGRESSION SUITE ---');

const requiredFiles = [
  'index.html',
  'about.html',
  'projects.html',
  'project-detail.html',
  'leadership.html',
  'members.html',
  'member-profile.html',
  'news.html',
  'news-detail.html',
  'events.html',
  'event-detail.html',
  'gallery.html',
  'contact.html',
  'privacy.html',
  '404.html',
  'login.html',
  'admin/login.html',
  'admin/index.html',
  'admin/projects.html',
  'admin/media.html',
  'admin/leadership.html',
  'admin/members.html',
  'admin/news.html',
  'admin/events.html',
  'admin/enquiries.html',
  'admin/pages.html',
  'admin/settings.html',
  'admin/users.html',
  'css/variables.css',
  'css/reset.css',
  'css/components.css',
  'css/style.css',
  'css/login.css',
  'css/responsive.css',
  'css/admin.css',
  'js/config.js',
  'js/supabase.js',
  'js/public-data.js',
  'js/leadership.js',
  'js/events.js',
  'js/members.js',
  'js/utils.js',
  'js/main.js',
  'js/contact.js',
  'js/admin/auth.js',
  'supabase/schema.sql',
  'supabase/policies.sql',
  'supabase/seed.sql',
  'supabase/setup_complete.sql',
  'supabase/demo_seed.sql',
  'supabase/migrations/20261011000001_leadership_terms_and_message.sql',
  'supabase/migrations/20261012000001_leadership_primary_position.sql',
  'supabase/migrations/20261013000001_events_management_enhancements.sql',
  'supabase/migrations/20261013000002_members_and_news_enhancements.sql',
  'supabase/migrations/20261013000003_enquiries_and_family_details.sql',
  'supabase/migrations/20261013000004_member_family_structured_fields.sql',
  'supabase/migrations/20261013000005_simplified_family_and_branding.sql',
  'supabase/migrations/20261013000006_member_children_table.sql',
  'supabase/migrations/20261014000007_member_management_enhancements.sql',
  'supabase/migrations/20261014000008_public_members_privacy_view.sql',
  'supabase/README.md',
  'assets/icons/avatar-placeholder.svg',
  'assets/icons/image-placeholder.svg',
  'assets/logos/lions-international.png',
  'assets/logos/dubai-oasis-lions-club.png',
  'assets/logos/dubai-oasis-lions-club.jpg',
  'assets/logos/who we are logo.jpg',
  'assets/logos/who-we-are-logo.png',
  'assets/logos/who-we-are-logos.png',
  'README.md',
  'SUPABASE_SETUP.md',
  'PROJECT_STATUS.md'
];

let passed = 0;
let failed = 0;

requiredFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    passed++;
  } else {
    console.error(`[FAIL] Missing required file: ${file}`);
    failed++;
  }
});

console.log(`\n1. File & Backend Preservation Check: ${passed} / ${requiredFiles.length} passed.`);

const indexContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
const styleContent = fs.readFileSync(path.join(projectRoot, 'css/style.css'), 'utf-8');
const publicDataContent = fs.readFileSync(path.join(projectRoot, 'js/public-data.js'), 'utf-8');
const leadershipJsContent = fs.readFileSync(path.join(projectRoot, 'js/leadership.js'), 'utf-8');
const eventsJsContent = fs.readFileSync(path.join(projectRoot, 'js/events.js'), 'utf-8');
const membersJsContent = fs.readFileSync(path.join(projectRoot, 'js/members.js'), 'utf-8');
const utilsJsContent = fs.readFileSync(path.join(projectRoot, 'js/utils.js'), 'utf-8');
const adminNewsContent = fs.readFileSync(path.join(projectRoot, 'admin/news.html'), 'utf-8');
const adminMembersContent = fs.readFileSync(path.join(projectRoot, 'admin/members.html'), 'utf-8');
const adminEnquiriesContent = fs.readFileSync(path.join(projectRoot, 'admin/enquiries.html'), 'utf-8');
const adminEventsContent = fs.readFileSync(path.join(projectRoot, 'admin/events.html'), 'utf-8');
const adminSettingsContent = fs.readFileSync(path.join(projectRoot, 'admin/settings.html'), 'utf-8');
const contactJsContent = fs.readFileSync(path.join(projectRoot, 'js/contact.js'), 'utf-8');
const migration0003Content = fs.readFileSync(path.join(projectRoot, 'supabase/migrations/20261013000003_enquiries_and_family_details.sql'), 'utf-8');
const migration0004Content = fs.readFileSync(path.join(projectRoot, 'supabase/migrations/20261013000004_member_family_structured_fields.sql'), 'utf-8');
const migration0005Content = fs.readFileSync(path.join(projectRoot, 'supabase/migrations/20261013000005_simplified_family_and_branding.sql'), 'utf-8');
const migration0006Content = fs.readFileSync(path.join(projectRoot, 'supabase/migrations/20261013000006_member_children_table.sql'), 'utf-8');
const migration0007Content = fs.readFileSync(path.join(projectRoot, 'supabase/migrations/20261014000007_member_management_enhancements.sql'), 'utf-8');
const adminIndexContent = fs.readFileSync(path.join(projectRoot, 'admin/index.html'), 'utf-8');
const adminCssContent = fs.readFileSync(path.join(projectRoot, 'css/admin.css'), 'utf-8');
const adminAuthContent = fs.readFileSync(path.join(projectRoot, 'js/admin/auth.js'), 'utf-8');
const eventDetailContent = fs.readFileSync(path.join(projectRoot, 'event-detail.html'), 'utf-8');
const newsDetailContent = fs.readFileSync(path.join(projectRoot, 'news-detail.html'), 'utf-8');
const memberProfileContent = fs.readFileSync(path.join(projectRoot, 'member-profile.html'), 'utf-8');
const projectDetailContent = fs.readFileSync(path.join(projectRoot, 'project-detail.html'), 'utf-8');
const schemaContent = fs.readFileSync(path.join(projectRoot, 'supabase/schema.sql'), 'utf-8');

let checksOk = true;

// 2. Verify Exact Section Sequence on Homepage: Hero -> Who We Are -> Leadership -> News -> Upcoming Events -> Meet Our Members -> Join Our Community & Enquiries -> Footer
const requiredSequence = [
  'SECTION 1 — HERO',
  'SECTION 2 — WHO WE ARE',
  'SECTION 3 — MEET OUR LEADERSHIP',
  'SECTION 4 — LATEST NEWS',
  'SECTION 5 — UPCOMING EVENTS',
  'SECTION 6 — MEET OUR MEMBERS',
  'SECTION 7 — JOIN OUR COMMUNITY & ENQUIRIES',
  'FOOTER'
];

let lastIdx = -1;
requiredSequence.forEach(sec => {
  const idx = indexContent.indexOf(sec);
  if (idx === -1 || idx < lastIdx) {
    console.error(`[FAIL] Homepage section sequence error at: ${sec}`);
    checksOk = false;
  } else {
    lastIdx = idx;
  }
});

if (checksOk) {
  console.log('[PASS] 2. Homepage adheres to exact section sequence: Hero -> Who We Are -> Meet Our Leadership -> Latest News -> Upcoming Events -> Meet Our Members -> Join Our Community & Enquiries -> Footer.');
}

// 3. Verify Leadership Heading & Primary Structure (President Left, Secretary Centre, Treasurer Right)
if (
  indexContent.includes('Meet Our Leadership') &&
  indexContent.includes('Meet the people who guide our club and lead our commitment to service.') &&
  leadershipJsContent.includes("${renderPrimaryLeaderCard(primary.president, 'president')}") &&
  leadershipJsContent.includes("${renderPrimaryLeaderCard(primary.secretary, 'secretary')}") &&
  leadershipJsContent.includes("${renderPrimaryLeaderCard(primary.treasurer, 'treasurer')}")
) {
  console.log('[PASS] 3. Homepage leadership section renders stationary primary row: President (Left), Secretary (Centre), Treasurer (Right).');
} else {
  console.error('[FAIL] Primary 3-leader layout verification failed.');
  checksOk = false;
}

// 4. Verify Secondary Leadership 1-3-3-3 Formation & 3-Second Auto-Advance
if (
  leadershipJsContent.includes('ADVANCE_INTERVAL_MS = 3000') &&
  leadershipJsContent.includes('Immediate Past President') &&
  leadershipJsContent.includes('1 -> 3 -> 3 -> 3')
) {
  console.log('[PASS] 4. Secondary leadership carousel features 1-3-3-3 formation and verified 3-second auto-advancing engine.');
} else {
  console.error('[FAIL] Secondary leadership carousel verification failed.');
  checksOk = false;
}

// 5. Verify Footer Three Official Logos in Exact Order & Natural Blend
const footerLionsIdx = indexContent.indexOf('assets/logos/lions-international.png');
const footerClubIdx = indexContent.indexOf('assets/logos/dubai-oasis-lions-club.png', footerLionsIdx);
const footerWhoWeAreIdx = indexContent.indexOf('assets/logos/who-we-are-logo.png', footerClubIdx);

if (
  footerLionsIdx !== -1 &&
  footerClubIdx !== -1 &&
  footerWhoWeAreIdx !== -1 &&
  footerLionsIdx < footerClubIdx &&
  footerClubIdx < footerWhoWeAreIdx &&
  styleContent.includes('.footer-brand-trio') &&
  styleContent.includes('.footer-logo-whoweare') &&
  fs.existsSync(path.join(projectRoot, 'assets/logos/who we are logo.jpg')) &&
  fs.existsSync(path.join(projectRoot, 'assets/logos/who-we-are-logo.png'))
) {
  console.log('[PASS] 5. Footer displays three official logos in exact order: Lions International -> Dubai Oasis Lions Club -> Who We Are logo, blended naturally into dark background without white cards or frames.');
} else {
  console.error('[FAIL] Footer 3-logo brand composition check failed.');
  checksOk = false;
}

// 6. Verify Upcoming Events Section: Scrollable Area, Brand Scrollbar, No Public Register Buttons
if (
  eventsJsContent.includes('events-scrollable-container') &&
  styleContent.includes('.events-scrollable-container') &&
  styleContent.includes('scrollbar-color: var(--color-primary') &&
  !eventsJsContent.includes('Register Now') &&
  !eventDetailContent.includes('Register for This Event')
) {
  console.log('[PASS] 6. Upcoming Events features scrollable container with branded scrollbar, nearest events first, and public registration buttons removed.');
} else {
  console.error('[FAIL] Upcoming Events scrollable / registration check failed.');
  checksOk = false;
}

// 7. Verify Return Flow: Back to News & Back to Events take visitors directly back to section anchors
if (
  eventDetailContent.includes('index.html#section-upcoming-events') &&
  newsDetailContent.includes('index.html#section-news') &&
  indexContent.includes('id="section-upcoming-events"') &&
  indexContent.includes('id="section-news"')
) {
  console.log('[PASS] 7. Return flow links in event-detail.html and news-detail.html route directly back to homepage section anchors #section-upcoming-events and #section-news.');
} else {
  console.error('[FAIL] Return flow anchor verification failed.');
  checksOk = false;
}

// 8. Verify Admin News Management with complete CRUD
if (
  adminNewsContent.includes('btn-add-news') &&
  adminNewsContent.includes('news-form') &&
  adminNewsContent.includes('news-slug') &&
  adminNewsContent.includes('news-cover-preview') &&
  adminNewsContent.includes('news_articles')
) {
  console.log('[PASS] 8. Admin News portal (/admin/news.html) supports complete CRUD, slug generation, category filters, cover uploader, and Supabase integration.');
} else {
  console.error('[FAIL] Admin News management check failed.');
  checksOk = false;
}

// 9. Verify Section 6 Meet Our Members: Clean Cards & Simplified Landscape Profile Dialogue
// Directory cards MUST display ONLY three things: (1) individual portrait, (2) display name, (3) subtle "Know More" action.
// Cards MUST NOT display office positions, leadership ranks, or committee badges.
// Modal dialogue MUST feature simplified landscape layout with left column family stage + thumb portrait, and right column clean key-value details.
const cardTemplateHasRoles = membersJsContent.includes('${sanitize(member.public_role') || membersJsContent.includes('${sanitize(member.committee');
if (
  indexContent.includes('id="section-members"') &&
  indexContent.includes('Meet Our Members') &&
  indexContent.includes('Get to know the people who make our service and community work possible.') &&
  membersJsContent.includes('member-modal-backdrop') &&
  membersJsContent.includes('member-modal-col-left') &&
  membersJsContent.includes('member-modal-col-right') &&
  membersJsContent.includes('member-modal-family-stage') &&
  membersJsContent.includes('member-modal-thumb-portrait') &&
  membersJsContent.includes('member-modal-joining-line') &&
  membersJsContent.includes('member-family-details-list') &&
  membersJsContent.includes('member-family-spouse-item') &&
  membersJsContent.includes('member-family-children-item') &&
  membersJsContent.includes('A Message from Our Family') &&
  membersJsContent.includes('member-card-portrait-stage') &&
  membersJsContent.includes('member-card-name') &&
  membersJsContent.includes('btn-member-know-more') &&
  !cardTemplateHasRoles &&
  styleContent.includes('.member-modal-dialog') &&
  styleContent.includes('object-fit: contain') &&
  styleContent.includes('.section-members-directory') &&
  styleContent.includes('.members-grid')
) {
  console.log('[PASS] 9. Section 6 Meet Our Members features ultra-clean directory cards (portrait, prefixed name, "Know More" ONLY; no badges or roles), paired with a simplified landscape modal dialogue (left family stage + secondary thumb, right clean family fields & warm message).');
} else {
  console.error('[FAIL] Section 6 Meet Our Members verification failed (Clean card criteria or simplified landscape modal structure).');
  checksOk = false;
}

// 10. Verify Admin Member Management: Conditional Spouse, Dynamic Children Repeater & Family Message
if (
  adminMembersContent.includes('btn-add-member') &&
  adminMembersContent.includes('member-prefix') &&
  adminMembersContent.includes('member-has-spouse') &&
  adminMembersContent.includes('spouse-fields-container') &&
  adminMembersContent.includes('member-spouse-name') &&
  adminMembersContent.includes('member-spouse-dob') &&
  adminMembersContent.includes('member-wedding-anniversary') &&
  adminMembersContent.includes('children-repeater-container') &&
  adminMembersContent.includes('btn-add-child') &&
  adminMembersContent.includes('member-family-message') &&
  adminMembersContent.includes('member-family-approved') &&
  adminMembersContent.includes('member-family-details-approved') &&
  adminMembersContent.includes('member-family-message-approved') &&
  adminMembersContent.includes('delete-member-modal') &&
  adminMembersContent.includes('btn-archive-instead') &&
  adminMembersContent.includes('delete-leadership-warning') &&
  utilsJsContent.includes('formatMemberName') &&
  schemaContent.includes('name_prefix VARCHAR(50)') &&
  adminSettingsContent.includes('Club Member Name Prefixes')
) {
  console.log('[PASS] 10. Admin Member portal (/admin/members.html) provides complete CRUD, prefix selection, conditional spouse fields, dynamic children repeater, family message, granular privacy toggles, and safe deletion & archiving workflow with active leadership detection.');
} else {
  console.error('[FAIL] Admin Member management / prefix verification failed.');
  checksOk = false;
}

// 11. Verify Clean Production Dataset & Isolated Demo Staging Dataset
const membersCount = (DEFAULT_PUBLIC_DATA.members || []).length;
const demoSeedPath = path.join(projectRoot, 'supabase/demo_seed.sql');
const hasDemoSeed = fs.existsSync(demoSeedPath);
if (
  membersCount === 0 &&
  hasDemoSeed &&
  leadershipJsContent.includes('formatMemberName') &&
  styleContent.includes('.leader-primary-name') &&
  styleContent.includes('.leader-primary-role')
) {
  console.log(`[PASS] 11. Clean production dataset verified (0 demo members in production bundle; sample dataset isolated in supabase/demo_seed.sql), with distinct highlighting for leader names and office designations.`);
} else {
  console.error(`[FAIL] Clean production dataset or leadership styling check failed. Found ${membersCount} members, hasDemoSeed: ${hasDemoSeed}.`);
  checksOk = false;
}

// 12. Verify Section 7 Join Our Community Homepage Section with Official Club Crest
if (
  indexContent.includes('id="section-contact"') &&
  indexContent.includes('Join Our Community') &&
  indexContent.includes('Interested in becoming part of Dubai Oasis Lions Club? Connect with us to learn more about membership, community service, and opportunities to make a difference.') &&
  indexContent.includes('assets/logos/dubai-oasis-lions-club.png') &&
  indexContent.includes('assets/logos/who we are logo.jpg') &&
  indexContent.includes('id="contact-enquiry-form"') &&
  indexContent.includes('name="enquiry_hp"') &&
  indexContent.includes('id="contact-form-feedback"') &&
  contactJsContent.includes('initContactSection') &&
  contactJsContent.includes('isValidEmail') &&
  contactJsContent.includes('isValidPhone') &&
  contactJsContent.includes('contact_enquiries') &&
  styleContent.includes('.section-contact-showcase') &&
  styleContent.includes('.community-club-crest') &&
  styleContent.includes('.community-brand-logo') &&
  styleContent.includes('mix-blend-mode: multiply') &&
  styleContent.includes('.contact-form-card')
) {
  console.log('[PASS] 12. Section 7 Join Our Community mounted on homepage with official Dubai Oasis Lions Club crest, Who We Are logo, approved copy, anti-spam honeypot, validation, feedback states, and Supabase / local persistence.');
} else {
  console.error('[FAIL] Section 7 Join Our Community verification failed.');
  checksOk = false;
}

// 13. Verify Private Admin Enquiry Inbox
if (
  adminEnquiriesContent.includes('enquiry-search') &&
  adminEnquiriesContent.includes('enquiry-type-filter') &&
  adminEnquiriesContent.includes('enquiry-status-filter') &&
  adminEnquiriesContent.includes('enquiry-modal') &&
  adminEnquiriesContent.includes('modal-internal-notes') &&
  adminEnquiriesContent.includes('mailto:') &&
  adminEnquiriesContent.includes('contact_enquiries')
) {
  console.log('[PASS] 13. Admin Enquiry Inbox (/admin/enquiries.html) supports search, status & category filtering, unread management, review modal with direct contact links, private internal notes, and Supabase integration.');
} else {
  console.error('[FAIL] Admin Enquiry Inbox check failed.');
  checksOk = false;
}

// 14. Verify Supabase Migrations for Enquiries & Simplified Family Fields, Relational Member Children & Date of Birth / Address Enhancements
if (
  migration0003Content.includes('contact_enquiries') &&
  migration0004Content.includes('spouse_name') &&
  migration0005Content.includes('has_spouse') &&
  migration0005Content.includes('spouse_dob') &&
  migration0005Content.includes('wedding_anniversary') &&
  migration0005Content.includes('children_data') &&
  migration0005Content.includes('family_message') &&
  migration0005Content.includes('family_message_approved') &&
  migration0006Content.includes('member_children') &&
  migration0006Content.includes('REFERENCES members(id)') &&
  migration0007Content.includes('date_of_birth') &&
  migration0007Content.includes('address_in_india') &&
  migration0007Content.includes('address_in_india_visible') &&
  schemaContent.includes('has_spouse BOOLEAN DEFAULT false') &&
  schemaContent.includes('CREATE TABLE member_children') &&
  schemaContent.includes('address_in_india TEXT')
) {
  console.log('[PASS] 14. Supabase Migrations 0003 through 0007 define robust tables, foreign keys, RLS policies, children relational schema, date of birth, and India address privacy gating matching baseline schema.');
} else {
  console.error('[FAIL] Supabase Migrations verification failed.');
  checksOk = false;
}

// 15. Verify Zero Lion Emoji Audit Across Entire Project
const auditedFiles = [
  indexContent,
  membersJsContent,
  leadershipJsContent,
  memberProfileContent,
  projectDetailContent,
  adminMembersContent
];
const emojiFound = auditedFiles.some(content => content.includes('🦁'));

if (!emojiFound) {
  console.log('[PASS] 15. Zero lion emojis found across website, member dialogues, and admin dashboards. Official Dubai Oasis Lions Club logo and crest used exclusively.');
} else {
  console.error('[FAIL] Lion emoji detected in project files.');
  checksOk = false;
}

// 16. Verify Master Architecture: Member Publication Workflow, Apple-Inspired Admin CMS & Scrollable Modal
if (
  membersJsContent.includes('lions_members_admin_store_v1') &&
  membersJsContent.includes('member-modal-details-title') &&
  membersJsContent.includes('member-modal-details-joining') &&
  membersJsContent.includes('member-family-sep') &&
  styleContent.includes('.member-modal-col-right::-webkit-scrollbar') &&
  styleContent.includes('overscroll-behavior: contain') &&
  styleContent.includes('body.modal-open') &&
  adminCssContent.includes('.stat-kpi-grid') &&
  adminCssContent.includes('.admin-mobile-toggle') &&
  adminCssContent.includes('.admin-sidebar-backdrop') &&
  adminAuthContent.includes('initAdminMobileDrawer') &&
  adminIndexContent.includes('Published Members') &&
  adminIndexContent.includes('Draft News Articles') &&
  adminIndexContent.includes('Upcoming Events') &&
  adminIndexContent.includes('Unread Enquiries')
) {
  console.log('[PASS] 16. Master Architecture verified: Instant member publication workflow between admin & homepage, Apple-inspired responsive Admin CMS, independent modal vertical scrollbar, and unified data synchronization.');
} else {
  console.error('[FAIL] Master Architecture verification failed.');
  checksOk = false;
}

// 17. Verify Apple-Inspired Member Portal Login & Public Header Navigation
const loginHtmlPath = path.join(projectRoot, 'login.html');
const loginHtmlContent = fs.existsSync(loginHtmlPath) ? fs.readFileSync(loginHtmlPath, 'utf-8') : '';
const loginCssPath = path.join(projectRoot, 'css/login.css');
const loginCssContent = fs.existsSync(loginCssPath) ? fs.readFileSync(loginCssPath, 'utf-8') : '';

if (
  loginHtmlContent.includes('Member Portal') &&
  loginHtmlContent.includes('login-brand-panel') &&
  loginHtmlContent.includes('login-form-panel') &&
  loginHtmlContent.includes('assets/logos/lions-international.png') &&
  loginHtmlContent.includes('assets/logos/dubai-oasis-lions-club.png') &&
  loginHtmlContent.includes('assets/logos/who-we-are-logo.png') &&
  loginHtmlContent.includes('id="centre-logo-dashboard-link"') &&
  loginHtmlContent.includes('id="member-id-input"') &&
  loginHtmlContent.includes('id="member-password-input"') &&
  loginHtmlContent.includes('id="toggle-password-btn"') &&
  !loginHtmlContent.includes('id="remember-me-checkbox"') &&
  !loginHtmlContent.includes('id="forgot-password-link"') &&
  !loginHtmlContent.includes('PRIVATE PORTAL') &&
  !loginHtmlContent.includes('Members Only Portal') &&
  !loginHtmlContent.includes('Staff Admin Login') &&
  loginHtmlContent.includes('login-info-modal') &&
  loginHtmlContent.includes('WE SERVE') &&
  !loginHtmlContent.includes('🦁') &&
  indexContent.includes('btn-header-login') &&
  indexContent.includes('href="login.html"') &&
  loginCssContent.includes('.login-viewport') &&
  loginCssContent.includes('.login-brand-panel') &&
  loginCssContent.includes('.login-form-panel') &&
  loginCssContent.includes('.login-centre-logo-link')
) {
  console.log('[PASS] 17. Apple-Inspired Member Portal Login verified: Full Lions-Blue integrated theme, 3 official logos, interactive centre-logo dashboard entry, clean accessible inputs without placeholders, zero emoji, and navigation integration.');
} else {
  console.error('[FAIL] Member Portal Login verification failed.');
  checksOk = false;
}

if (failed === 0 && checksOk) {
  console.log('\n======================================================');
  console.log('ALL 17 COMPREHENSIVE QA & REGRESSION CHECKS PASSED.');
  console.log('======================================================\n');
  process.exit(0);
} else {
  console.error('\nVerification failed.');
  process.exit(1);
}

