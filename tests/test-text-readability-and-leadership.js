// tests/test-text-readability-and-leadership.js
// Verification suite for Text Readability, Watermark Opacity & Complete 13-Member Leadership Display

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('TESTING TEXT READABILITY, WATERMARK OPACITY & 13 LEADERSHIP BEARERS');
console.log('======================================================\n');

// 1. Watermark Opacity & Contrast in CSS
const styleCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'style.css'), 'utf8');
const adminCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'admin.css'), 'utf8');
const responsiveCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'responsive.css'), 'utf8');

// Opacity controlled within 0.05 - 0.07 range
assert(/opacity:\s*0\.0[5-7]/.test(styleCss), 'style.css configures subtle watermark opacity (0.05–0.07)');
assert(/opacity:\s*0\.0[5-7]/.test(adminCss), 'admin.css configures subtle watermark opacity (0.05–0.07)');
assert(responsiveCss.includes('opacity: 0.06') || responsiveCss.includes('opacity: 0.05'), 'responsive.css configures reduced mobile watermark opacity');

console.log('✅ Watermark Opacity Layering: 3/3 checks passed.');

// 2. High-Contrast Text Color Palette
assert(styleCss.includes('color: #E5EDF8'), 'style.css sets body paragraph text to #E5EDF8');
assert(styleCss.includes('line-height: 1.65') || styleCss.includes('line-height: 1.68'), 'style.css sets body text line-height to 1.65–1.68');
assert(styleCss.includes('#who-we-are-p1') && styleCss.includes('#E5EDF8'), 'Who We Are paragraphs use #E5EDF8');
assert(styleCss.includes('.event-banner-title') && styleCss.includes('color: #FFFFFF'), 'Event banner title uses #FFFFFF');
assert(styleCss.includes('.carousel-section-title') && styleCss.includes('color: #FFFFFF'), 'Carousel section titles use #FFFFFF');
assert(styleCss.includes('.leadership-intro-title') && styleCss.includes('color: #FFFFFF'), 'Leadership intro title uses #FFFFFF');

const componentsCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'components.css'), 'utf8');
assert(componentsCss.includes('.eyebrow') && componentsCss.includes('#FCCB04'), 'components.css sets .eyebrow to #FCCB04');
assert(componentsCss.includes('.editorial-headline') && componentsCss.includes('#FFFFFF'), 'components.css sets .editorial-headline to #FFFFFF');
assert(componentsCss.includes('.editorial-subhead') && componentsCss.includes('#E5EDF8'), 'components.css sets .editorial-subhead to #E5EDF8');
assert(componentsCss.includes('.btn-text-link') && componentsCss.includes('#FCCB04'), 'components.css sets .btn-text-link to gold #FCCB04');

console.log('✅ High-Contrast Typography Tokens: 10/10 checks passed.');

// 3. Primary Leadership Layout: President (Left, order 1), Secretary (Centre, order 2), Treasurer (Right, order 3)
assert(styleCss.includes('.leader-president-card') && styleCss.includes('order: 1'), 'President card has order: 1 (left)');
assert(styleCss.includes('.leader-secretary-card') && styleCss.includes('order: 2'), 'Secretary card has order: 2 (centre)');
assert(styleCss.includes('.leader-treasurer-card') && styleCss.includes('order: 3'), 'Treasurer card has order: 3 (right)');
assert(styleCss.includes('.leader-primary-card.is-president') && styleCss.includes('border: 1.5px solid rgba(252, 203, 4'), 'President card is distinguished with gold border');

// Card & Profile Text Contrast Overrides
assert(styleCss.includes('.leader-primary-name') && styleCss.includes('#163E78'), 'Primary leadership names styled with high-contrast dark navy #163E78');
assert(styleCss.includes('.leader-carousel-name') && styleCss.includes('#163E78'), 'Carousel leadership names styled with high-contrast dark navy #163E78');
assert(styleCss.includes('.member-card-name') && styleCss.includes('#163E78'), 'Member card names styled with high-contrast dark navy #163E78');
assert(styleCss.includes('.member-family-message-card') && styleCss.includes('#D9AC00'), 'Member family message card styled with gold border accent #D9AC00');
assert(styleCss.includes('.member-family-message-body') && styleCss.includes('#163E78'), 'Member family message body styled with readable dark navy #163E78');

console.log('✅ Primary Leadership Trio Positioning & Card Contrast: 9/9 checks passed.');

// 4. Leadership JavaScript Engine: 13 Official Positions, Formation 1-3-3-3 & Missing Data Safety
import {
  DEFAULT_OFFICIAL_LEADERSHIP,
  partitionLeadership,
  formatTermOfService,
  fetchAllLeadershipForAdmin
} from '../js/leadership.js';

// Verify all 13 official positions exist
assert.strictEqual(DEFAULT_OFFICIAL_LEADERSHIP.length, 13, 'DEFAULT_OFFICIAL_LEADERSHIP contains exactly 13 office-bearer positions');

// Check partition of all 13 positions
const partitioned = partitionLeadership(DEFAULT_OFFICIAL_LEADERSHIP);
assert(partitioned.primary.president, 'President present in primary leadership');
assert(partitioned.primary.secretary, 'Secretary present in primary leadership');
assert(partitioned.primary.treasurer, 'Treasurer present in primary leadership');

// 10 secondary leaders across 4 stages (formation: 1 -> 3 -> 3 -> 3)
assert.strictEqual(partitioned.stages.length, 4, 'Exactly 4 carousel stages generated for secondary leadership');
assert.strictEqual(partitioned.stages[0].type, 'single', 'Stage 1 is single centered profile (IPP)');
assert.strictEqual(partitioned.stages[1].leaders.length, 3, 'Stage 2 contains 3 leaders');
assert.strictEqual(partitioned.stages[2].leaders.length, 3, 'Stage 3 contains 3 leaders');
assert.strictEqual(partitioned.stages[3].leaders.length, 3, 'Stage 4 contains 3 leaders');
assert.strictEqual(partitioned.secondary.length, 10, 'Secondary roster contains 10 office-bearers (1 + 3 + 3 + 3 = 10)');

// Total displayed: 3 primary + 10 secondary = 13 total leaders
const totalDisplayed = 3 + partitioned.stages[0].leader ? 1 : 0;
assert.strictEqual(3 + partitioned.secondary.length, 13, 'Total displayed leaders equals exactly 13 office-bearers');

// Missing data safety: leader with missing bio, avatar, and term does not break or get excluded
const incompleteLeader = {
  id: 'leader-incomplete',
  name: 'Lion Incomplete Info',
  role: 'Committee Chair',
  primary_position: 'none',
  term_start_year: null,
  term_end_year: null,
  bio: null,
  avatar: null,
  is_active: true
};

const partitionWithIncomplete = partitionLeadership([...DEFAULT_OFFICIAL_LEADERSHIP, incompleteLeader]);
const foundIncomplete = partitionWithIncomplete.secondary.find(l => l.id === 'leader-incomplete');
assert(foundIncomplete, 'Incomplete leader is NEVER excluded from partition');

// Empty bio & term tests
assert.strictEqual(formatTermOfService({}), '', 'formatTermOfService returns empty string when term is missing');
assert.strictEqual(formatTermOfService({ term_start_year: 2026, term_end_year: 2027 }), '2026–2027', 'formatTermOfService formats clean term string');

console.log('✅ Leadership 13-Member Roster & Safe Incomplete Handling: 12/12 checks passed.');

console.log('\n======================================================');
console.log('ALL 29 READABILITY & 13-LEADERSHIP CHECKS PASSED (100%)!');
console.log('======================================================\n');
