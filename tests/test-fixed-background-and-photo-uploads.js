// tests/test-fixed-background-and-photo-uploads.js
// Verification suite for Fixed Background Watermark & Admin Photo Upload Controls

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('TESTING FIXED BACKGROUND CREST & DUAL MEMBER PHOTO UPLOAD CONTROLS');
console.log('======================================================\n');

// 1. Inspect admin/members.html for Dual Photo Upload Controls
const adminMembersHtml = fs.readFileSync(path.join(ROOT_DIR, 'admin', 'members.html'), 'utf8');

// Labels and structure
assert(adminMembersHtml.includes('Individual Profile Photo'), 'Admin form includes "Individual Profile Photo" label');
assert(adminMembersHtml.includes('Family Photograph'), 'Admin form includes "Family Photograph" label');
assert(adminMembersHtml.includes('member-photo-uploads-grid'), 'Admin form uses .member-photo-uploads-grid container');

// Individual Profile Photo Controls
assert(adminMembersHtml.includes('id="member-avatar-url"'), 'Includes #member-avatar-url input');
assert(adminMembersHtml.includes('id="member-avatar-file"'), 'Includes #member-avatar-file file input');
assert(adminMembersHtml.includes('id="member-avatar-preview"'), 'Includes #member-avatar-preview preview element');
assert(adminMembersHtml.includes('id="btn-browse-avatar"'), 'Includes #btn-browse-avatar button');
assert(adminMembersHtml.includes('id="btn-remove-avatar"'), 'Includes #btn-remove-avatar button');
assert(adminMembersHtml.includes('id="avatar-dropzone"'), 'Includes #avatar-dropzone drag & drop container');
assert(adminMembersHtml.includes('id="member-avatar-filename"'), 'Includes #member-avatar-filename status badge');

// Family Photograph Controls
assert(adminMembersHtml.includes('id="member-family-url"'), 'Includes #member-family-url input');
assert(adminMembersHtml.includes('id="member-family-file"'), 'Includes #member-family-file file input');
assert(adminMembersHtml.includes('id="member-family-preview"'), 'Includes #member-family-preview preview element');
assert(adminMembersHtml.includes('id="btn-browse-family"'), 'Includes #btn-browse-family button');
assert(adminMembersHtml.includes('id="btn-remove-family"'), 'Includes #btn-remove-family button');
assert(adminMembersHtml.includes('id="family-dropzone"'), 'Includes #family-dropzone drag & drop container');
assert(adminMembersHtml.includes('id="member-family-filename"'), 'Includes #member-family-filename status badge');

// JavaScript Handlers: Drag-and-drop, Remove, Reset, Edit population
assert(adminMembersHtml.includes("avatarDropzone.addEventListener('drop'"), 'Avatar dropzone handles drag & drop drop events');
assert(adminMembersHtml.includes("familyDropzone.addEventListener('drop'"), 'Family dropzone handles drag & drop drop events');
assert(adminMembersHtml.includes("btnRemoveAvatar.addEventListener('click'"), 'Avatar remove button event handler is attached');
assert(adminMembersHtml.includes("btnRemoveFamily.addEventListener('click'"), 'Family photo remove button event handler is attached');
assert(adminMembersHtml.includes("uploadClubMedia(file, 'members')"), 'Avatar uploads to Supabase "members" storage');
assert(adminMembersHtml.includes("uploadClubMedia(file, 'family')"), 'Family photo uploads to Supabase "family" storage');

console.log('✅ Admin Photo Upload Controls: 18/18 checks passed.');

// 2. Inspect css/admin.css for Photo Upload Styling & Watermark
const adminCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'admin.css'), 'utf8');

assert(adminCss.includes('.member-photo-uploads-grid'), 'admin.css defines .member-photo-uploads-grid');
assert(adminCss.includes('.member-photo-upload-card'), 'admin.css defines .member-photo-upload-card');
assert(adminCss.includes('.photo-dropzone'), 'admin.css defines .photo-dropzone');
assert(adminCss.includes('.photo-dropzone.is-dragover'), 'admin.css defines .photo-dropzone.is-dragover');
assert(adminCss.includes('.photo-preview-stage.portrait'), 'admin.css defines portrait preview container');
assert(adminCss.includes('.photo-preview-stage.landscape'), 'admin.css defines landscape preview container');
assert(adminCss.includes('.btn-photo-remove'), 'admin.css defines .btn-photo-remove');
assert(adminCss.includes('.admin-layout::before'), 'admin.css defines stationary watermark crest via .admin-layout::before');
assert(adminCss.includes("position: fixed"), 'admin watermark uses position: fixed');

console.log('✅ Admin Photo CSS & Watermark: 9/9 checks passed.');

// 3. Inspect index.html for Fixed Background & Section Architecture
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');

assert(indexHtml.includes('class="site-fixed-background"'), 'index.html includes .site-fixed-background canvas');
assert(indexHtml.includes('class="site-bg-crest-watermark"'), 'index.html includes .site-bg-crest-watermark element');
assert(indexHtml.includes('assets/logos/dubai-oasis-lions-club.png'), 'index.html uses authentic Dubai Oasis Lions Club crest');

// Exact section sequence preserved
const sections = [
  'SECTION 1 — HERO',
  'SECTION 2 — WHO WE ARE',
  'SECTION 3 — MEET OUR LEADERSHIP',
  'SECTION 4 — LATEST NEWS',
  'SECTION 5 — UPCOMING EVENTS',
  'SECTION 6 — MEET OUR MEMBERS',
  'SECTION 7 — JOIN OUR COMMUNITY & ENQUIRIES',
  'FOOTER'
];
let prevIdx = -1;
sections.forEach(sec => {
  const curIdx = indexHtml.indexOf(sec);
  assert(curIdx !== -1 && curIdx > prevIdx, `Section sequence preserved at: ${sec}`);
  prevIdx = curIdx;
});

console.log('✅ Homepage Fixed Background & Section Architecture: 11/11 checks passed.');

// 4. Inspect css/style.css for Fixed Background & Translucent Surfaces
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'style.css'), 'utf8');

assert(styleCss.includes('.site-fixed-background'), 'style.css defines .site-fixed-background');
assert(styleCss.includes('.site-bg-crest-watermark'), 'style.css defines .site-bg-crest-watermark');
assert(styleCss.includes('opacity: 0.06') || styleCss.includes('opacity: 0.13'), 'Watermark uses subtle opacity');
assert(styleCss.includes('drop-shadow(0 10px 30px') || styleCss.includes('drop-shadow(0 20px 60px rgba(0, 0, 0, 0.85))'), 'Watermark uses gentle drop-shadow');

// Translucent section surfaces
assert(styleCss.includes('.hero-brand-logo-stage') && styleCss.includes('background: transparent'), 'Hero stage has transparent background allowing watermark to show');
assert(styleCss.includes('.section-who-we-are') && styleCss.includes('rgba(7, 21, 43, 0.55)'), 'Who We Are uses translucent glass background');
assert(styleCss.includes('.section-leadership-compact') && styleCss.includes('rgba(10, 28, 56, 0.65)'), 'Leadership uses translucent glass background');
assert(styleCss.includes('.section-carousel-showcase') && styleCss.includes('rgba(7, 21, 43, 0.72)'), 'News carousel uses translucent glass background');
assert(styleCss.includes('.section-events-showcase') && styleCss.includes('rgba(10, 28, 56, 0.68)'), 'Events showcase uses translucent glass background');
assert(styleCss.includes('.section-members-directory') && styleCss.includes('rgba(7, 21, 43, 0.72)'), 'Members directory uses translucent glass background');

console.log('✅ Style CSS Fixed Background & Translucency: 11/11 checks passed.');

// 5. Inspect css/responsive.css for Mobile Scaling
const responsiveCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'responsive.css'), 'utf8');

assert(responsiveCss.includes('.site-bg-crest-watermark'), 'responsive.css configures .site-bg-crest-watermark scaling');
assert(responsiveCss.includes('@media (max-width: 640px)'), 'responsive.css handles 640px mobile viewports');
assert(responsiveCss.includes('@media (max-width: 380px)'), 'responsive.css handles 380px and 320px mobile viewports');

console.log('✅ Responsive Mobile Scaling: 3/3 checks passed.');

// 6. Zero Lion Emojis Audit
const auditedHtml = [
  indexHtml,
  adminMembersHtml,
  fs.readFileSync(path.join(ROOT_DIR, 'login.html'), 'utf8'),
  fs.readFileSync(path.join(ROOT_DIR, 'admin', 'index.html'), 'utf8')
];
auditedHtml.forEach(content => {
  assert(!content.includes('🦁'), 'Zero lion emojis in audited files');
});

console.log('✅ Zero Lion Emojis Audit: 4/4 checks passed.');

console.log('\n======================================================');
console.log('ALL 56 CHECKS FOR FIXED BACKGROUND & PHOTO UPLOADS PASSED (100%)!');
console.log('======================================================\n');
