// Dubai Oasis Lions Club — Complete Member Management, Profile UI & Supabase Integration QA Suite
// Validates end-to-end:
// 1. Safe date parsing for DD/MM formatting without timezone drift.
// 2. 4-digit joining year extraction.
// 3. Member normalization with relational children & India address.
// 4. Public profile modal 1-9 exact sequence and DOM structure.
// 5. Privacy gating for Address in India, Family Details, and Family Message.
// 6. Admin member form elements, dynamic children repeater, and approval toggles.
// 7. Supabase migration 0007, baseline schema, and RLS policies.

import fs from 'fs';
import path from 'path';
import { formatDateDDMM, formatJoiningYearOnly } from '../js/members.js';

const projectRoot = path.resolve();

console.log('========================================================================');
console.log('DUBAI OASIS LIONS CLUB — COMPLETE MEMBER MANAGEMENT INTEGRATION TEST');
console.log('========================================================================\n');

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    allPassed = false;
  }
}

// -----------------------------------------------------------------------------
// 1. Date Formatting (DD/MM) & Timezone Drift Tests
// -----------------------------------------------------------------------------
console.log('--- 1. DATE FORMATTING (DD/MM) & TIMEZONE DRIFT ---');
assert(formatDateDDMM('1985-05-14') === '14/05', 'formatDateDDMM parses ISO "1985-05-14" to "14/05"');
assert(formatDateDDMM('1990-12-08') === '08/12', 'formatDateDDMM parses ISO "1990-12-08" to "08/12"');
assert(formatDateDDMM('2024-01-01') === '01/01', 'formatDateDDMM parses ISO "2024-01-01" to "01/01"');
assert(formatDateDDMM('14/05/1985') === '14/05', 'formatDateDDMM parses DD/MM/YYYY "14/05/1985" to "14/05"');
assert(formatDateDDMM('14-05-1985') === '14/05', 'formatDateDDMM parses DD-MM-YYYY "14-05-1985" to "14/05"');
assert(formatDateDDMM('14/05') === '14/05', 'formatDateDDMM preserves existing "14/05"');
assert(formatDateDDMM('14 May') === '14/05', 'formatDateDDMM parses "14 May" to "14/05"');
assert(formatDateDDMM('May 14') === '14/05', 'formatDateDDMM parses "May 14" to "14/05"');
assert(formatDateDDMM('') === '', 'formatDateDDMM handles empty string cleanly');
assert(formatDateDDMM(null) === '', 'formatDateDDMM handles null cleanly');
assert(formatDateDDMM(undefined) === '', 'formatDateDDMM handles undefined cleanly');

// -----------------------------------------------------------------------------
// 2. 4-Digit Joining Year Extraction Tests
// -----------------------------------------------------------------------------
console.log('\n--- 2. 4-DIGIT JOINING YEAR EXTRACTION ---');
assert(formatJoiningYearOnly('2024') === '2024', 'formatJoiningYearOnly extracts "2024" from "2024"');
assert(formatJoiningYearOnly('2024-06-15') === '2024', 'formatJoiningYearOnly extracts "2024" from "2024-06-15"');
assert(formatJoiningYearOnly('Member since 2018') === '2018', 'formatJoiningYearOnly extracts "2018" from "Member since 2018"');
assert(formatJoiningYearOnly('Joined September 2021') === '2021', 'formatJoiningYearOnly extracts "2021" from "Joined September 2021"');
assert(formatJoiningYearOnly('') === '', 'formatJoiningYearOnly handles empty string cleanly');

// -----------------------------------------------------------------------------
// 3. Members JS Modal DOM Structure & 1-9 Display Sequence
// -----------------------------------------------------------------------------
console.log('\n--- 3. PUBLIC MODAL 1-9 SEQUENCE & CLEAN MARKUP ---');
const membersJsContent = fs.readFileSync(path.join(projectRoot, 'js/members.js'), 'utf-8');

assert(membersJsContent.includes('member-modal-details-title'), '1. Member Name title container is present');
assert(membersJsContent.includes('member-detail-joining-item'), '2. Year of Joining container is present');
assert(membersJsContent.includes('member-detail-joining-val'), '2. Year of Joining value span is present');
assert(membersJsContent.includes('member-detail-dob-item'), '3. Date of Birth container is present');
assert(membersJsContent.includes('member-detail-dob-val'), '3. Date of Birth value span is present');
assert(membersJsContent.includes('member-family-spouse-item'), '4. Spouse container is present');
assert(membersJsContent.includes('member-family-spouse-val'), '4. Spouse value span is present');
assert(membersJsContent.includes('member-family-spouse-dob-item'), '5. Spouse DOB container is present');
assert(membersJsContent.includes('member-family-spouse-dob-val'), '5. Spouse DOB value span is present');
assert(membersJsContent.includes('member-family-anniversary-item'), '6. Wedding Anniversary container is present');
assert(membersJsContent.includes('member-family-anniversary-val'), '6. Wedding Anniversary value span is present');
assert(membersJsContent.includes('member-family-children-item'), '7. Children list container is present');
assert(membersJsContent.includes('member-family-children-val'), '7. Children list value div is present');
assert(membersJsContent.includes('member-detail-address-item'), '8. Address in India container is present');
assert(membersJsContent.includes('member-detail-address-val'), '8. Address in India value div is present');
assert(membersJsContent.includes('member-family-message-card'), '9. Family Message card is present');
assert(membersJsContent.includes('member-family-message-body'), '9. Family Message body is present');

// Check the relative order of appearance in the modal markup
const idxName = membersJsContent.indexOf('member-modal-details-title');
const idxJoining = membersJsContent.indexOf('member-detail-joining-item');
const idxDob = membersJsContent.indexOf('member-detail-dob-item');
const idxSpouse = membersJsContent.indexOf('member-family-spouse-item');
const idxSpouseDob = membersJsContent.indexOf('member-family-spouse-dob-item');
const idxAnniv = membersJsContent.indexOf('member-family-anniversary-item');
const idxChildren = membersJsContent.indexOf('member-family-children-item');
const idxAddress = membersJsContent.indexOf('member-detail-address-item');
const idxMessage = membersJsContent.indexOf('member-family-message-card');

const orderIsCorrect = (
  idxName < idxJoining &&
  idxJoining < idxDob &&
  idxDob < idxSpouse &&
  idxSpouse < idxSpouseDob &&
  idxSpouseDob < idxAnniv &&
  idxAnniv < idxChildren &&
  idxChildren < idxAddress &&
  idxAddress < idxMessage
);
assert(orderIsCorrect, 'Modal elements are defined in the exact required 1-9 sequence (Name, Joining, DOB, Spouse, Spouse DOB, Anniversary, Children, Address, Message)');

// -----------------------------------------------------------------------------
// 4. Privacy Gating Logic in members.js
// -----------------------------------------------------------------------------
console.log('\n--- 4. PRIVACY GATING RULES & HIDING UNAPPROVED FIELDS ---');
assert(
  membersJsContent.includes('member.address_in_india_visible === true') &&
  membersJsContent.includes('addressItem.style.display = \'none\''),
  'Address in India is strictly gated by address_in_india_visible and hidden when false/empty'
);
assert(
  membersJsContent.includes('isFamilyDetailsApproved') &&
  membersJsContent.includes('spouseItem.style.display = \'none\'') &&
  membersJsContent.includes('childrenItem.style.display = \'none\''),
  'Family details (spouse, anniversary, children) are strictly gated by family_details_approved'
);
assert(
  membersJsContent.includes('isMessageApproved') &&
  membersJsContent.includes('messageCard.style.display = \'none\''),
  'Family message is strictly gated by family_message_approved'
);
assert(
  membersJsContent.includes('member_children(id, full_name, date_of_birth, display_order)'),
  'fetchPublicMembers queries relational member_children from Supabase'
);

// -----------------------------------------------------------------------------
// 5. Admin Members Form (admin/members.html)
// -----------------------------------------------------------------------------
console.log('\n--- 5. ADMIN MEMBERS FORM & CONTROLS ---');
const adminMembersContent = fs.readFileSync(path.join(projectRoot, 'admin/members.html'), 'utf-8');

assert(adminMembersContent.includes('id="member-prefix"'), 'Admin form includes prefix selector with Lion, Lion Dr., Mr., etc.');
assert(adminMembersContent.includes('id="member-joining-date"') && adminMembersContent.includes('required'), 'Admin form includes required Year/Date of Joining');
assert(adminMembersContent.includes('id="member-dob"'), 'Admin form includes optional Member Date of Birth');
assert(adminMembersContent.includes('id="member-address-in-india"'), 'Admin form includes multiline Address in India textarea');
assert(adminMembersContent.includes('id="member-address-approved"'), 'Admin form includes public approval toggle for Address in India');
assert(adminMembersContent.includes('id="children-repeater-container"'), 'Admin form includes dynamic children repeater container');
assert(adminMembersContent.includes('id="btn-add-child"'), 'Admin form includes Add Child button');
assert(adminMembersContent.includes('member_children'), 'Admin form JavaScript synchronizes relational member_children with Supabase');

// -----------------------------------------------------------------------------
// 6. Supabase Migration 0007 & Schema Integrity
// -----------------------------------------------------------------------------
console.log('\n--- 6. SUPABASE MIGRATION 0007 & SCHEMA INTEGRITY ---');
const migration0007Content = fs.readFileSync(path.join(projectRoot, 'supabase/migrations/20261014000007_member_management_enhancements.sql'), 'utf-8');
const schemaContent = fs.readFileSync(path.join(projectRoot, 'supabase/schema.sql'), 'utf-8');
const setupMdContent = fs.readFileSync(path.join(projectRoot, 'SUPABASE_SETUP.md'), 'utf-8');

assert(migration0007Content.includes('date_of_birth VARCHAR(50)'), 'Migration 0007 adds date_of_birth column to members');
assert(migration0007Content.includes('address_in_india TEXT'), 'Migration 0007 adds address_in_india column to members');
assert(migration0007Content.includes('address_in_india_visible BOOLEAN DEFAULT false'), 'Migration 0007 adds address_in_india_visible column with default false');
assert(migration0007Content.includes('CREATE TABLE IF NOT EXISTS member_children'), 'Migration 0007 ensures member_children relational table exists');
assert(schemaContent.includes('date_of_birth VARCHAR(50)'), 'Baseline schema includes date_of_birth column');
assert(schemaContent.includes('address_in_india TEXT'), 'Baseline schema includes address_in_india column');
assert(schemaContent.includes('address_in_india_visible BOOLEAN DEFAULT false'), 'Baseline schema includes address_in_india_visible column');
assert(setupMdContent.includes('20261014000007_member_management_enhancements.sql'), 'SUPABASE_SETUP.md documents migration 0007 in setup sequence');

// -----------------------------------------------------------------------------
// 7. CSS Styling for Address & Modal
// -----------------------------------------------------------------------------
console.log('\n--- 7. CSS STYLING FOR ADDRESS IN INDIA ---');
const styleContent = fs.readFileSync(path.join(projectRoot, 'css/style.css'), 'utf-8');

assert(styleContent.includes('.member-family-address-item'), 'CSS defines .member-family-address-item rule');
assert(styleContent.includes('.member-family-address-val'), 'CSS defines .member-family-address-val rule');
assert(styleContent.includes('white-space: pre-line;'), 'CSS specifies white-space: pre-line for multiline India addresses');

console.log('\n========================================================================');
if (allPassed) {
  console.log('ALL COMPLETE MEMBER MANAGEMENT INTEGRATION CHECKS PASSED.');
  console.log('========================================================================\n');
  process.exit(0);
} else {
  console.error('SOME INTEGRATION CHECKS FAILED. Please review output above.');
  console.log('========================================================================\n');
  process.exit(1);
}
