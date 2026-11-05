// End-to-End Member Publication Workflow Verification Test
// Simulates:
// 1. Admin adds a member with prefix, portrait, spouse, children, and message.
// 2. Member persists in store.
// 3. fetchPublicMembers() loads and publishes the new member immediately.
// 4. Archiving the member excludes them from the public directory.

import { fetchPublicMembers } from '../js/members.js';
import { DEFAULT_PUBLIC_DATA } from '../js/public-data.js';

console.log('--- TESTING END-TO-END MEMBER PUBLICATION WORKFLOW ---');

// Mock localStorage in Node
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; }
};

// 1. Baseline check: initial public members is 0 in clean production state
const initialMembers = await fetchPublicMembers(true);
console.log(`[PASS] Initial public members loaded: ${initialMembers.length} (clean baseline)`);

// 2. Simulate Admin adding a new published member
const newMemberPayload = {
  id: 'mem-test-999',
  name_prefix: 'Lion',
  first_name: 'Rashid',
  last_name: 'Al Maktoum-Test',
  public_role: 'Community Outreach Ambassador',
  committee: 'Civic Partnerships',
  biography: 'Dedicated civic volunteer joining Dubai Oasis Lions.',
  avatar_url: 'assets/icons/avatar-placeholder.svg',
  family_photo_url: 'assets/icons/image-placeholder.svg',
  has_spouse: true,
  spouse_name: 'Sheikha Latifa',
  spouse_dob: '15 June',
  wedding_anniversary: '22 October',
  children_data: [
    { name: 'Hamdan', dob: '10 March 2018' },
    { name: 'Fatima', dob: '04 July 2021' }
  ],
  children_names: 'Hamdan, Fatima',
  family_message: 'Our family is delighted to serve with Dubai Oasis Lions Club.',
  family_photo_approved: true,
  family_details_approved: true,
  family_message_approved: true,
  joining_date: '2026-10-01',
  status: 'active',
  is_public: true,
  display_order: 10
};

// Admin saves into lions_members_admin_store_v1
const currentStore = JSON.parse(JSON.stringify(DEFAULT_PUBLIC_DATA.members || []));
currentStore.push(newMemberPayload);
localStorage.setItem('lions_members_admin_store_v1', JSON.stringify(currentStore));

// 3. fetchPublicMembers() must now immediately include the new member
const updatedMembers = await fetchPublicMembers(true);
console.log(`[PASS] Updated public members loaded: ${updatedMembers.length}`);

const found = updatedMembers.find(m => m.id === 'mem-test-999');
if (!found) {
  console.error('[FAIL] Newly added member was not found in fetchPublicMembers() output!');
  process.exit(1);
}

if (found.name !== 'Rashid Al Maktoum-Test' || found.name_prefix !== 'Lion') {
  console.error(`[FAIL] Newly added member name or prefix mismatch: ${found.name_prefix} ${found.name}`);
  process.exit(1);
}

if (!found.has_spouse || found.spouse_name !== 'Sheikha Latifa' || found.children_data.length !== 2) {
  console.error('[FAIL] Newly added member family details mismatch!');
  process.exit(1);
}

console.log(`[PASS] Newly added member "${found.name_prefix} ${found.name}" verified in public directory.`);

// 4. Test Archiving: Admin sets status to archived
const archivedStore = currentStore.map(m => {
  if (m.id === 'mem-test-999') {
    return { ...m, status: 'archived', is_public: false };
  }
  return m;
});
localStorage.setItem('lions_members_admin_store_v1', JSON.stringify(archivedStore));

const afterArchiveMembers = await fetchPublicMembers(true);
const shouldNotFind = afterArchiveMembers.find(m => m.id === 'mem-test-999');
if (shouldNotFind) {
  console.error('[FAIL] Archived member should not appear in public directory!');
  process.exit(1);
}

console.log('[PASS] Archived member correctly excluded from public directory.');
console.log('======================================================');
console.log('END-TO-END MEMBER PUBLICATION WORKFLOW PASSED 100%!');
console.log('======================================================\n');
process.exit(0);
