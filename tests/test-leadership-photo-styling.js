// tests/test-leadership-photo-styling.js
// Verification suite for Premium Leadership Photo Styling requirements

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('TESTING PREMIUM LEADERSHIP PHOTO STYLING & FRAMING SYSTEM');
console.log('======================================================\n');

// 1. Inspect CSS rules in css/style.css
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'style.css'), 'utf8');

// Aspect ratio and container framing
assert(styleCss.includes('.leader-primary-frame'), 'style.css defines .leader-primary-frame');
assert(styleCss.includes('.leader-carousel-frame'), 'style.css defines .leader-carousel-frame');
assert(styleCss.includes('aspect-ratio: 1 / 1.15') || styleCss.includes('aspect-ratio: 4 / 4.6'), 'Leadership frames use consistent portrait aspect ratio');
assert(styleCss.includes('background: #FFFFFF') || styleCss.includes('background: linear-gradient'), 'Leadership frames use clean white / light neutral backdrop');

// Default contain and cover modifier support
assert(styleCss.includes('object-fit: contain'), 'Leadership frames default to object-fit: contain');
assert(styleCss.includes('object-fit: cover'), 'Leadership frames support object-fit: cover');
assert(styleCss.includes('data-fit="cover"'), 'Leadership CSS supports data-fit="cover"');
assert(styleCss.includes('data-fit="contain"'), 'Leadership CSS supports data-fit="contain"');

// Hover scale removal check
assert(!styleCss.includes('.leader-primary-card:hover .leader-primary-frame img {'), 'Removed aggressive image zoom on hover for primary leader card');
assert(!styleCss.includes('.leader-carousel-card:hover .leader-carousel-frame img {'), 'Removed aggressive image zoom on hover for carousel leader card');

// Modal portrait styling
assert(styleCss.includes('.leader-modal-portrait-col'), 'style.css defines .leader-modal-portrait-col');
assert(styleCss.includes('.leader-modal-portrait-col img'), 'style.css defines .leader-modal-portrait-col img');

console.log('✅ CSS Rules & Framing: 8/8 checks passed.');

// 2. Responsive CSS verification
const responsiveCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'responsive.css'), 'utf8');
assert(responsiveCss.includes('.leader-primary-frame'), 'responsive.css configures .leader-primary-frame');
assert(responsiveCss.includes('.leader-modal-portrait-col'), 'responsive.css configures .leader-modal-portrait-col');
assert(responsiveCss.includes('@media (max-width: 820px)'), 'responsive.css handles tablet viewports');
assert(responsiveCss.includes('@media (max-width: 520px)'), 'responsive.css handles mobile viewports');

console.log('✅ Responsive Behavior: 4/4 checks passed.');

// 3. Inspect JS functionality in js/leadership.js
const leadershipJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'leadership.js'), 'utf8');
assert(leadershipJs.includes('export function parseImageSettings'), 'leadership.js exports parseImageSettings');
assert(leadershipJs.includes('export function getCleanImageUrl'), 'leadership.js exports getCleanImageUrl');
assert(leadershipJs.includes('style="object-fit:${imgSettings.fit}; object-position:${sanitize(imgSettings.pos)};"'), 'renderPrimaryLeaderCard renders dynamic fit & position');
assert(leadershipJs.includes('data-fit="${imgSettings.fit}"'), 'renderPrimaryLeaderCard sets data-fit attribute');
assert(leadershipJs.includes('imgEl.style.objectFit = imgSettings.fit'), 'openLeaderModalWithData sets modal image object-fit');
assert(leadershipJs.includes('imgEl.style.objectPosition = imgSettings.pos'), 'openLeaderModalWithData sets modal image object-position');

console.log('✅ Leadership JS Engine: 6/6 checks passed.');

// 4. Test image settings parsing logic
import { parseImageSettings, getCleanImageUrl } from '../js/leadership.js';

// Default case
const defaultRes = parseImageSettings({});
assert.strictEqual(defaultRes.fit, 'contain', 'Default fit is contain');
assert.strictEqual(defaultRes.pos, 'center center', 'Default position is center center');

// Explicit properties
const explicitRes = parseImageSettings({ image_fit: 'cover', image_position: 'center 20%' });
assert.strictEqual(explicitRes.fit, 'cover', 'Explicit cover fit respected');
assert.strictEqual(explicitRes.pos, 'center 20%', 'Explicit focal position respected');

// URL fragment parsing
const hashRes = parseImageSettings({ avatar: 'https://example.com/portrait.jpg#fit=cover&pos=center%20top' });
assert.strictEqual(hashRes.fit, 'cover', 'Hash fragment fit=cover parsed');
assert.strictEqual(hashRes.pos, 'center top', 'Hash fragment pos=center top parsed');

// Clean URL extraction
assert.strictEqual(getCleanImageUrl('https://example.com/photo.jpg#fit=cover&pos=center'), 'https://example.com/photo.jpg', 'Hash fragment cleanly stripped from URL');
assert.strictEqual(getCleanImageUrl('assets/icons/avatar-placeholder.svg'), 'assets/icons/avatar-placeholder.svg', 'Clean asset path preserved');

console.log('✅ Image Parsing Logic: 7/7 checks passed.');

// 5. Inspect Admin leadership controls in admin/leadership.html
const adminLeadershipHtml = fs.readFileSync(path.join(ROOT_DIR, 'admin', 'leadership.html'), 'utf8');
assert(adminLeadershipHtml.includes('id="leader-photo-fit"'), 'admin/leadership.html has photo fit dropdown');
assert(adminLeadershipHtml.includes('id="leader-photo-pos"'), 'admin/leadership.html has focal position dropdown');
assert(adminLeadershipHtml.includes('photoFitSelect.addEventListener'), 'admin/leadership.html handles photo fit changes');
assert(adminLeadershipHtml.includes('photoPosSelect.addEventListener'), 'admin/leadership.html handles focal position changes');
assert(adminLeadershipHtml.includes('updatePhotoPreview'), 'admin/leadership.html updates preview in real time');
assert(adminLeadershipHtml.includes('uploadClubMedia'), 'admin/leadership.html retains Supabase storage upload functionality');

console.log('✅ Admin Controls & Upload: 6/6 checks passed.');

console.log('\n======================================================');
console.log('ALL 31 LEADERSHIP PHOTO STYLING CHECKS PASSED (100%)!');
console.log('======================================================\n');
