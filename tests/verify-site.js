// Automated Verification & QA Test Suite
// Validates Targeted Leadership Redesign, Interactive Profile Modal, About Brand Split,
// Preserved News Editorial Carousel, and Exact 11-Section Order.

import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve();

console.log('--- DUBAI OASIS LIONS CLUB TARGETED REDESIGN QA SUITE ---');

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
  'gallery.html',
  'events.html',
  'contact.html',
  'privacy.html',
  '404.html',
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
  'css/responsive.css',
  'css/admin.css',
  'js/config.js',
  'js/supabase.js',
  'js/public-data.js',
  'js/leadership.js',
  'js/utils.js',
  'js/main.js',
  'js/admin/auth.js',
  'supabase/schema.sql',
  'supabase/policies.sql',
  'supabase/seed.sql',
  'supabase/README.md',
  'assets/logos/lions-international.png',
  'assets/images/hero-service.jpg',
  'assets/images/leadership-1.jpg',
  'assets/images/leadership-2.jpg',
  'assets/images/leadership-3.jpg',
  'assets/images/project-vision.jpg',
  'assets/images/project-food.jpg',
  'assets/images/project-youth.jpg',
  'assets/images/project-eco.jpg',
  'README.md',
  'SUPABASE_SETUP.md'
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

console.log(`\nFile & Asset QA Results: ${passed} / ${requiredFiles.length} passed.`);

const indexContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf-8');
const leadershipPageContent = fs.readFileSync(path.join(projectRoot, 'leadership.html'), 'utf-8');
const aboutPageContent = fs.readFileSync(path.join(projectRoot, 'about.html'), 'utf-8');
const leadershipJsContent = fs.readFileSync(path.join(projectRoot, 'js/leadership.js'), 'utf-8');
const mainJsContent = fs.readFileSync(path.join(projectRoot, 'js/main.js'), 'utf-8');

// 1. Verify Exact 11-Section Sequence
const sections = [
  'SECTION 1 — HERO',
  'SECTION 2 — MEET OUR LEADERSHIP',
  'SECTION 3 — LATEST NEWS & ANNOUNCEMENTS',
  'SECTION 4 — UPCOMING EVENTS',
  'SECTION 5 — WELCOME TO OUR CLUB',
  'SECTION 6 — FEATURED SERVICE PROJECTS',
  'SECTION 7 — OUR IMPACT',
  'SECTION 8 — MEET OUR MEMBERS',
  'SECTION 9 — MOMENTS OF SERVICE',
  'SECTION 10 — GET INVOLVED',
  'SECTION 11 — FOOTER'
];

let lastIndex = -1;
let checksOk = true;

sections.forEach((sec) => {
  const foundIdx = indexContent.indexOf(sec);
  if (foundIdx === -1 || foundIdx < lastIndex) {
    console.error(`[FAIL] Section sequence error at: ${sec}`);
    checksOk = false;
  } else {
    lastIndex = foundIdx;
  }
});

if (checksOk) {
  console.log('[PASS] Homepage strictly adheres to 11-section sequence with Meet Our Leadership immediately after Hero.');
}

// 2. Verify Oversized Leadership Carousel Removed & Compact Split Showcase Present
if (indexContent.includes('leadership-carousel-mount')) {
  console.error('[FAIL] Oversized leadership-carousel-mount still present on homepage.');
  checksOk = false;
} else if (indexContent.includes('section-leadership-compact') && indexContent.includes('leadership-compact-mount')) {
  console.log('[PASS] Oversized rectangular leadership banner removed; compact split leadership showcase verified.');
} else {
  console.error('[FAIL] Compact leadership showcase mount missing.');
  checksOk = false;
}

// 3. Verify News Editorial Carousel Preserved
if (indexContent.includes('news-carousel-mount') && mainJsContent.includes('renderNewsCarousel')) {
  console.log('[PASS] Approved News Editorial Carousel ("The Latest") preserved intact.');
} else {
  console.error('[FAIL] News editorial carousel missing.');
  checksOk = false;
}

// 4. Verify Shared Leadership Data & Interactive Profile Modal
if (
  leadershipJsContent.includes('leader-profile-modal') &&
  leadershipJsContent.includes('openLeaderModalById') &&
  leadershipPageContent.includes('fetchVerifiedLeadership') &&
  mainJsContent.includes('fetchVerifiedLeadership')
) {
  console.log('[PASS] Shared leadership module & interactive profile modal connected across index.html and leadership.html.');
} else {
  console.error('[FAIL] Shared leadership module or modal wiring incomplete.');
  checksOk = false;
}

// 5. Verify About Page Uses Official Logo Split Composition
if (aboutPageContent.includes('about-brand-hero') && aboutPageContent.includes('assets/logos/lions-international.png')) {
  console.log('[PASS] About Us page features split-screen brand composition with official logo artwork.');
} else {
  console.error('[FAIL] About Us brand logo composition missing.');
  checksOk = false;
}

if (failed === 0 && checksOk) {
  console.log('\nALL TARGETED REDESIGN & FUNCTIONALITY CHECKS PASSED.');
  process.exit(0);
} else {
  console.error('\nVerification encountered errors.');
  process.exit(1);
}
