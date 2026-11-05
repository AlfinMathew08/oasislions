// Public Member Directory & Large Premium Profile Modal
// Strictly conforms to Part 1 & Part 2:
// - Member cards display ONLY: Individual photo, prefixed display name, and subtle "Know More" action.
// - Modal displays: Two-column layout with individual portrait, prefixed name, biography, joining date,
//   and dedicated family information / approved family photo (strictly hidden unless approved).
// - No organizational ranks, leadership designations, committee positions, or focus areas.

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { DEFAULT_PUBLIC_DATA } from './public-data.js';
import { sanitize, formatMemberName } from './utils.js';

export const MEMBERS_STORAGE_KEY = 'lions_members_admin_store_v1';

let cachedMembers = null;
let activeModalTrigger = null;
let modalInjected = false;

/**
 * Safe date parsing for DD/MM formatting without timezone shifting.
 * Handles ISO (YYYY-MM-DD), DD/MM/YYYY, DD-MM-YYYY, DD/MM, named months, and Date strings.
 */
export function formatDateDDMM(dateStr) {
  if (!dateStr) return '';
  const trimmed = String(dateStr).trim();
  if (!trimmed) return '';

  // Check YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const day = isoMatch[3].padStart(2, '0');
    const month = isoMatch[2].padStart(2, '0');
    return `${day}/${month}`;
  }

  // Check DD/MM/YYYY or DD-MM-YYYY or DD/MM
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-]\d{2,4})?$/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, '0');
    const month = ddmmyyyyMatch[2].padStart(2, '0');
    return `${day}/${month}`;
  }

  // Check Day Month or Month Day (e.g., "14 May", "May 14", "14 December")
  const monthNames = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };
  const dayMonthMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)/);
  if (dayMonthMatch) {
    const day = dayMonthMatch[1].padStart(2, '0');
    const monStr = dayMonthMatch[2].toLowerCase();
    if (monthNames[monStr]) {
      return `${day}/${monthNames[monStr]}`;
    }
  }
  const monthDayMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2})/);
  if (monthDayMatch) {
    const monStr = monthDayMatch[1].toLowerCase();
    const day = monthDayMatch[2].padStart(2, '0');
    if (monthNames[monStr]) {
      return `${day}/${monthNames[monStr]}`;
    }
  }

  // If already DD/MM
  if (/^\d{2}\/\d{2}$/.test(trimmed)) return trimmed;

  // Fallback to UTC Date parsing to prevent timezone drift
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }

  return trimmed;
}

/**
 * Extracts clean 4-digit joining year (e.g. "2024").
 */
export function formatJoiningYearOnly(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  const yearMatch = str.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) return yearMatch[1];
  return str;
}

/**
 * Normalizes member records from Supabase or fallback data.
 */
function normalizeMemberRecord(m, index = 0) {
  let childrenList = [];
  if (Array.isArray(m.member_children) && m.member_children.length > 0) {
    childrenList = m.member_children
      .slice()
      .sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0))
      .map(c => ({
        id: c.id,
        name: c.full_name || c.name || '',
        dob: c.date_of_birth || c.dob || ''
      }));
  } else if (Array.isArray(m.children_data)) {
    childrenList = m.children_data;
  } else if (typeof m.children_data === 'string') {
    try {
      const parsed = JSON.parse(m.children_data);
      if (Array.isArray(parsed)) childrenList = parsed;
    } catch (_) {}
  }

  return {
    id: m.id || `mem-${index + 1}`,
    name_prefix: m.name_prefix || m.prefix || 'Lion',
    first_name: m.first_name || '',
    last_name: m.last_name || '',
    name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Club Member',
    subtitle: m.subtitle || m.professional_background || '',
    joining_date: m.joining_date || m.created_at || null,
    date_of_birth: m.date_of_birth || null,
    address_in_india: m.address_in_india || null,
    address_in_india_visible: Boolean(m.address_in_india_visible),
    bio: m.bio || m.biography || '',
    avatar: m.avatar || m.avatar_url || 'assets/icons/avatar-placeholder.svg',
    family_photo_url: m.family_photo_url || null,
    family_photo_approved: Boolean(m.family_photo_approved),
    has_spouse: Boolean(m.has_spouse || (m.spouse_name && m.spouse_name.trim())),
    spouse_name: m.spouse_name || null,
    spouse_dob: m.spouse_dob || null,
    wedding_anniversary: m.wedding_anniversary || null,
    children_data: childrenList,
    children_names: m.children_names || m.family_members_names || null,
    family_message: m.family_message || null,
    family_message_approved: Boolean(m.family_message_approved !== undefined ? m.family_message_approved : m.family_details_approved),
    family_details_approved: Boolean(m.family_details_approved !== undefined ? m.family_details_approved : m.family_photo_approved),
    is_public: m.is_public !== false,
    status: m.status || 'active',
    display_order: Number(m.display_order) || (index + 1)
  };
}

/**
 * Loads published members from Supabase (using public_members privacy view).
 * Strictly excludes unpublished or private members.
 * Returns empty array when database is empty (no fake fallback data).
 */
export async function fetchPublicMembers(forceRefresh = false) {
  if (cachedMembers && !forceRefresh) return cachedMembers;

  const supabase = getSupabase();
  if (isSupabaseConfigured() && supabase) {
    try {
      // First attempt query on the secure public_members privacy view
      let res = await supabase
        .from('public_members')
        .select('id, name_prefix, first_name, last_name, professional_background, biography, avatar_url, family_photo_url, family_photo_approved, has_spouse, spouse_name, spouse_dob, wedding_anniversary, children_data, children_names, family_message, family_message_approved, family_details_approved, joining_date, date_of_birth, address_in_india, address_in_india_visible, is_public, status, display_order, member_children(id, full_name, date_of_birth, display_order)')
        .order('display_order', { ascending: true });

      // If view is not yet created on cloud, fallback to querying members table directly
      if (res.error && res.error.code === '42P01') {
        res = await supabase
          .from('members')
          .select('id, name_prefix, first_name, last_name, professional_background, biography, avatar_url, family_photo_url, family_photo_approved, has_spouse, spouse_name, spouse_dob, wedding_anniversary, children_data, children_names, family_message, family_message_approved, family_details_approved, joining_date, date_of_birth, address_in_india, address_in_india_visible, is_public, status, display_order, member_children(id, full_name, date_of_birth, display_order)')
          .eq('is_public', true)
          .neq('status', 'archived')
          .order('display_order', { ascending: true });
      }

      if (!res.error && Array.isArray(res.data)) {
        cachedMembers = res.data.map((m, idx) => normalizeMemberRecord(m, idx));
        return cachedMembers;
      }
    } catch (err) {
      console.warn('Supabase members fetch error:', err);
    }
  }

  try {
    const rawLocal = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedMembers = parsed
          .filter(m => m.is_public !== false && m.status !== 'archived')
          .map((m, idx) => normalizeMemberRecord(m, idx));
        return cachedMembers;
      }
    }
  } catch (_) {}

  // Never fall back to fake demo content. Supabase is single source of truth.
  cachedMembers = [];
  return cachedMembers;
}

/**
 * Formats joining date cleanly (e.g. "Joined 2021" or "Member since 2021").
 */
function formatJoiningYear(dateStr) {
  const year = formatJoiningYearOnly(dateStr);
  if (!year) return 'Active Member';
  return `Member since ${year}`;
}

/**
 * Injects the accessible landscape-oriented modal dialog into the DOM if not already present.
 */
function ensureMemberModalDOM() {
  if (modalInjected || document.getElementById('member-profile-modal')) return;

  const modalHtml = `
    <div id="member-profile-modal" class="member-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="member-modal-name" aria-hidden="true">
      <div class="member-modal-dialog">
        <button type="button" class="member-modal-close" aria-label="Close member profile modal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- LEFT COLUMN — PRIMARY FAMILY PHOTOGRAPH & RESTRAINED IDENTITY -->
        <div class="member-modal-col-left" id="member-modal-col-left">
          <!-- Primary Landscape Family Image Stage -->
          <div class="member-modal-family-stage" id="member-modal-family-stage">
            <img id="member-modal-family-img" src="" alt="Family photograph" class="member-modal-family-img">
          </div>

          <!-- Elegant Fallback when Family Photo is unapproved or not provided -->
          <div class="member-modal-fallback-stage" id="member-modal-fallback-stage" style="display:none;">
            <div class="member-modal-fallback-portrait-wrap">
              <img id="member-modal-fallback-img" src="assets/icons/avatar-placeholder.svg" alt="Member Portrait" class="member-modal-fallback-img">
            </div>
            <p class="member-modal-fallback-notice">Family photograph has not been provided or approved for public showcase.</p>
          </div>

          <!-- Restrained Identity Bar Beneath Photo -->
          <div class="member-modal-identity-bar">
            <div class="member-modal-identity-left">
              <img id="member-modal-thumb-portrait" src="assets/icons/avatar-placeholder.svg" alt="Member Portrait" class="member-modal-thumb-portrait">
              <div>
                <h3 class="member-modal-name" id="member-modal-name">Lion Member Name</h3>
                <div class="member-modal-joining-line" id="member-modal-joining-line">Club Member</div>
              </div>
            </div>
            <div class="member-modal-identity-tag">Dubai Oasis Lions Club &bull; UAE</div>
          </div>
        </div>

        <!-- RIGHT COLUMN — DETAILS & FAMILY INFORMATION -->
        <div class="member-modal-col-right" id="member-modal-col-right">
          <!-- 1. Member Name -->
          <div class="member-modal-details-header">
            <h3 class="member-modal-details-title" id="member-modal-details-title">Lion Member Name</h3>
            <div class="member-modal-details-joining" id="member-modal-details-joining">Dubai Oasis Lions Club</div>
          </div>

          <!-- Structured Key-Value Details (Items 2 through 8) -->
          <div class="member-family-details-list" id="member-family-details-list">
            <!-- 2. Year of Joining -->
            <div class="member-family-item" id="member-detail-joining-item" style="display:none;">
              <span class="member-family-label">Year of Joining</span>
              <span class="member-family-sep">—</span>
              <span class="member-family-value" id="member-detail-joining-val"></span>
            </div>

            <!-- 3. Date of Birth -->
            <div class="member-family-item" id="member-detail-dob-item" style="display:none;">
              <span class="member-family-label">Date of Birth</span>
              <span class="member-family-sep">—</span>
              <span class="member-family-value" id="member-detail-dob-val"></span>
            </div>

            <!-- 4. Spouse Name -->
            <div class="member-family-item" id="member-family-spouse-item" style="display:none;">
              <span class="member-family-label">Spouse</span>
              <span class="member-family-sep">—</span>
              <span class="member-family-value" id="member-family-spouse-val"></span>
            </div>

            <!-- 5. Spouse Date of Birth -->
            <div class="member-family-item" id="member-family-spouse-dob-item" style="display:none;">
              <span class="member-family-label">Spouse DOB</span>
              <span class="member-family-sep">—</span>
              <span class="member-family-value" id="member-family-spouse-dob-val"></span>
            </div>

            <!-- 6. Wedding Anniversary -->
            <div class="member-family-item" id="member-family-anniversary-item" style="display:none;">
              <span class="member-family-label">Wedding Anniversary</span>
              <span class="member-family-sep">—</span>
              <span class="member-family-value" id="member-family-anniversary-val"></span>
            </div>

            <!-- 7. Children List -->
            <div class="member-family-item member-family-children-item" id="member-family-children-item" style="display:none;">
              <span class="member-family-label">Children</span>
              <span class="member-family-sep">—</span>
              <div class="member-family-children-list" id="member-family-children-val"></div>
            </div>

            <!-- 8. Address in India -->
            <div class="member-family-item member-family-address-item" id="member-detail-address-item" style="display:none;">
              <span class="member-family-label">Address in India</span>
              <span class="member-family-sep">—</span>
              <div class="member-family-value member-family-address-val" id="member-detail-address-val"></div>
            </div>
          </div>

          <!-- 9. Family Message -->
          <div class="member-family-message-card" id="member-family-message-card" style="display:none;">
            <h4 class="member-family-message-title">A Message from Our Family</h4>
            <p class="member-family-message-body" id="member-family-message-body"></p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  modalInjected = true;

  const backdrop = document.getElementById('member-profile-modal');
  const closeBtn = backdrop.querySelector('.member-modal-close');

  closeBtn.addEventListener('click', closeMemberModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeMemberModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
      closeMemberModal();
    }
  });
}

/**
 * Opens the interactive landscape member profile modal with full accessibility.
 */
export function openMemberModal(member, triggerEl = null) {
  if (!member) return;
  ensureMemberModalDOM();

  activeModalTrigger = triggerEl;
  const backdrop = document.getElementById('member-profile-modal');
  if (!backdrop) return;

  const displayName = formatMemberName(member);
  const fallbackImg = 'assets/icons/avatar-placeholder.svg';

  // Elements
  const familyStage = document.getElementById('member-modal-family-stage');
  const familyImg = document.getElementById('member-modal-family-img');
  const fallbackStage = document.getElementById('member-modal-fallback-stage');
  const fallbackImgEl = document.getElementById('member-modal-fallback-img');
  const thumbPortrait = document.getElementById('member-modal-thumb-portrait');
  const nameEl = document.getElementById('member-modal-name');
  const joiningLineEl = document.getElementById('member-modal-joining-line');

  // Right column elements (Exact 1-9 Order)
  const detailsTitleEl = document.getElementById('member-modal-details-title');
  const detailsJoiningEl = document.getElementById('member-modal-details-joining');

  const joiningItem = document.getElementById('member-detail-joining-item');
  const joiningVal = document.getElementById('member-detail-joining-val');

  const dobItem = document.getElementById('member-detail-dob-item');
  const dobVal = document.getElementById('member-detail-dob-val');

  const spouseItem = document.getElementById('member-family-spouse-item');
  const spouseVal = document.getElementById('member-family-spouse-val');
  const spouseDobItem = document.getElementById('member-family-spouse-dob-item');
  const spouseDobVal = document.getElementById('member-family-spouse-dob-val');

  const anniversaryItem = document.getElementById('member-family-anniversary-item');
  const anniversaryVal = document.getElementById('member-family-anniversary-val');

  const childrenItem = document.getElementById('member-family-children-item');
  const childrenVal = document.getElementById('member-family-children-val');

  const addressItem = document.getElementById('member-detail-address-item');
  const addressVal = document.getElementById('member-detail-address-val');

  const messageCard = document.getElementById('member-family-message-card');
  const messageBody = document.getElementById('member-family-message-body');

  // 1. LEFT COLUMN — Family Photograph vs Fallback
  const hasApprovedFamilyPhoto = Boolean(member.family_photo_url && member.family_photo_approved === true);

  if (hasApprovedFamilyPhoto) {
    familyStage.style.display = 'flex';
    familyImg.src = member.family_photo_url;
    familyImg.alt = `${displayName} — Family Photograph`;
    fallbackStage.style.display = 'none';

    // Show secondary thumbnail of member portrait
    thumbPortrait.src = member.avatar || fallbackImg;
    thumbPortrait.alt = displayName;
    thumbPortrait.style.display = 'block';
  } else {
    familyStage.style.display = 'none';
    familyImg.src = '';
    fallbackStage.style.display = 'flex';
    fallbackImgEl.src = member.avatar || fallbackImg;
    fallbackImgEl.alt = displayName;

    // In fallback mode, portrait is already prominently displayed
    thumbPortrait.style.display = 'none';
  }

  // Identity bar beneath photo
  nameEl.textContent = displayName;
  const joiningYear = formatJoiningYearOnly(member.joining_date);
  joiningLineEl.textContent = joiningYear ? `Member since ${joiningYear}` : 'Club Member';

  // 2. RIGHT COLUMN — Render Details in Exact 1-9 Sequence:
  // 1. Member Name
  if (detailsTitleEl) detailsTitleEl.textContent = displayName;
  if (detailsJoiningEl) detailsJoiningEl.textContent = joiningYear ? `Dubai Oasis Lions Club • Since ${joiningYear}` : 'Dubai Oasis Lions Club';

  // 2. Year of Joining (4-digit year, e.g. 2024)
  if (joiningYear) {
    joiningVal.textContent = joiningYear;
    joiningItem.style.display = 'flex';
  } else {
    joiningVal.textContent = '';
    joiningItem.style.display = 'none';
  }

  // 3. Date of Birth (DD/MM)
  const memberDobFormatted = formatDateDDMM(member.date_of_birth);
  if (memberDobFormatted) {
    dobVal.textContent = memberDobFormatted;
    dobItem.style.display = 'flex';
  } else {
    dobVal.textContent = '';
    dobItem.style.display = 'none';
  }

  // 4, 5, 6, 7. Family Details (Strictly gated by approval)
  const isFamilyDetailsApproved = Boolean(member.family_details_approved === true);

  if (isFamilyDetailsApproved) {
    // 4. Spouse Name
    if (member.has_spouse && member.spouse_name && member.spouse_name.trim()) {
      spouseVal.textContent = member.spouse_name.trim();
      spouseItem.style.display = 'flex';

      // 5. Spouse DOB (DD/MM)
      const spouseDobFormatted = member.spouse_dob ? formatDateDDMM(member.spouse_dob) : '';
      if (spouseDobFormatted) {
        spouseDobVal.textContent = spouseDobFormatted;
        spouseDobItem.style.display = 'flex';
      } else {
        spouseDobVal.textContent = '';
        spouseDobItem.style.display = 'none';
      }

      // 6. Wedding Anniversary (DD/MM)
      const anniversaryFormatted = member.wedding_anniversary ? formatDateDDMM(member.wedding_anniversary) : '';
      if (anniversaryFormatted) {
        anniversaryVal.textContent = anniversaryFormatted;
        anniversaryItem.style.display = 'flex';
      } else {
        anniversaryVal.textContent = '';
        anniversaryItem.style.display = 'none';
      }
    } else {
      spouseItem.style.display = 'none';
      spouseVal.textContent = '';
      spouseDobItem.style.display = 'none';
      spouseDobVal.textContent = '';
      anniversaryItem.style.display = 'none';
      anniversaryVal.textContent = '';
    }

    // 7. Children (each child's name + DD/MM)
    const childrenList = Array.isArray(member.children_data) ? member.children_data : [];
    if (childrenList.length > 0) {
      childrenVal.innerHTML = childrenList.map(child => {
        const cName = sanitize(child.name || '');
        const cDobFormatted = formatDateDDMM(child.dob);
        const cDob = cDobFormatted ? `<span class="member-family-child-dob">(${sanitize(cDobFormatted)})</span>` : '';
        return `
          <div class="member-family-child-entry">
            <span class="member-family-child-name">${cName}</span>
            ${cDob}
          </div>
        `;
      }).join('');
      childrenItem.style.display = 'flex';
    } else if (member.children_names && member.children_names.trim()) {
      childrenVal.innerHTML = `
        <div class="member-family-child-entry">
          <span class="member-family-child-name">${sanitize(member.children_names.trim())}</span>
        </div>
      `;
      childrenItem.style.display = 'flex';
    } else {
      childrenItem.style.display = 'none';
      childrenVal.innerHTML = '';
    }
  } else {
    // Family details not approved: strictly hide spouse, anniversary, and children
    spouseItem.style.display = 'none';
    spouseVal.textContent = '';
    spouseDobItem.style.display = 'none';
    spouseDobVal.textContent = '';
    anniversaryItem.style.display = 'none';
    anniversaryVal.textContent = '';
    childrenItem.style.display = 'none';
    childrenVal.innerHTML = '';
  }

  // 8. Address in India (multiline, strictly only if address_in_india_visible === true)
  if (member.address_in_india_visible === true && member.address_in_india && member.address_in_india.trim()) {
    addressVal.textContent = member.address_in_india.trim();
    addressItem.style.display = 'flex';
  } else {
    addressVal.textContent = '';
    addressItem.style.display = 'none';
  }

  // 9. Family Message (strictly only if family_message_approved === true)
  const isMessageApproved = Boolean(member.family_message_approved === true);
  if (isMessageApproved && member.family_message && member.family_message.trim()) {
    messageBody.textContent = member.family_message.trim();
    messageCard.style.display = 'block';
  } else {
    messageCard.style.display = 'none';
    messageBody.textContent = '';
  }

  backdrop.classList.add('is-open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';

  // Focus trap: focus close button
  setTimeout(() => {
    backdrop.querySelector('.member-modal-close')?.focus();
  }, 80);
}

/**
 * Closes the member profile modal and restores keyboard focus.
 */
export function closeMemberModal() {
  const backdrop = document.getElementById('member-profile-modal');
  if (!backdrop) return;

  backdrop.classList.remove('is-open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';

  if (activeModalTrigger && typeof activeModalTrigger.focus === 'function') {
    activeModalTrigger.focus();
  }
}

/**
 * Renders a single clean member card (Part 1.1):
 * Displays ONLY:
 * 1. One individual photograph of the member.
 * 2. The member's display name directly underneath with prefix.
 * 3. A subtle "Know More" action.
 * Strictly NO ranks, roles, committee names, or badges.
 */
function renderMemberCard(m) {
  const displayName = formatMemberName(m);
  const fallbackImg = 'assets/icons/avatar-placeholder.svg';

  return `
    <article class="member-card" tabindex="0" role="button" aria-label="View profile of ${sanitize(displayName)}" data-member-id="${sanitize(m.id)}">
      <div class="member-card-portrait-stage">
        <img src="${sanitize(m.avatar || fallbackImg)}" alt="${sanitize(displayName)}" class="member-card-img" loading="lazy" onerror="this.src='${fallbackImg}'">
      </div>

      <div class="member-card-content">
        <h3 class="member-card-name">${sanitize(displayName)}</h3>
        <button type="button" class="btn-member-know-more" aria-label="Know more about ${sanitize(displayName)}">
          <span>Know More</span> &rarr;
        </button>
      </div>
    </article>
  `;
}

/**
 * Initializes the full Meet Our Members Directory with clean cards, instant search, and modal viewer.
 */
export async function initMembersDirectory(containerId = 'members-mount', searchInputId = 'member-search-input') {
  const mount = document.getElementById(containerId);
  if (!mount) return;

  ensureMemberModalDOM();

  const members = await fetchPublicMembers();
  let currentList = members;

  function renderList(list, isSearchResult = false) {
    if (!list || list.length === 0) {
      if (isSearchResult) {
        mount.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 class="empty-state-title">No Matching Members Found</h3>
            <p class="empty-state-desc">No club members match your search query. Try searching by another name.</p>
          </div>
        `;
      } else {
        mount.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 class="empty-state-title">Our Member Directory is Being Updated</h3>
            <p class="empty-state-desc">The official roster of Dubai Oasis Lions Club members for Lions Year 2026–2027 will be announced soon.</p>
          </div>
        `;
      }
      return;
    }

    mount.innerHTML = `
      <div class="members-grid">
        ${list.map(m => renderMemberCard(m)).join('')}
      </div>
    `;

    // Attach click and keyboard listeners to cards
    mount.querySelectorAll('.member-card').forEach(card => {
      const id = card.getAttribute('data-member-id');
      const targetMember = members.find(m => String(m.id) === String(id));

      card.addEventListener('click', () => openMemberModal(targetMember, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openMemberModal(targetMember, card);
        }
      });
    });
  }

  // Initial render
  renderList(currentList);

  // Setup search input if present
  const searchInput = document.getElementById(searchInputId);
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderList(members);
        return;
      }

      const filtered = members.filter(m => {
        const fullName = `${m.name_prefix || ''} ${m.name || ''} ${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
        const bio = (m.bio || '').toLowerCase();
        return fullName.includes(q) || bio.includes(q);
      });

      renderList(filtered, true);
    });
  }
}
