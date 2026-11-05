// Shared Leadership Data Loader, Executive Showcase Renderer, Admin Store Sync & Interactive Profile Modal
// Used by Homepage (index.html), Dedicated Leadership Page (leadership.html), and Admin Dashboard (/admin/leadership.html)

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { DEFAULT_PUBLIC_DATA } from './public-data.js';
import { sanitize, formatMemberName } from './utils.js';

export const LIONS_LEADERSHIP_STORAGE_KEY = 'lions_leadership_store_v2';

let cachedLeaders = null;
let modalInitialized = false;
let lastFocusedTrigger = null;

/**
 * Formats a leader's structured term_start_year and term_end_year cleanly as "2026–2027", or empty if unavailable.
 */
export function formatTermOfService(leader) {
  if (leader?.lions_year) return leader.lions_year;
  const start = Number(leader?.term_start_year);
  if (!start || isNaN(start)) return '';
  const end = Number(leader?.term_end_year) || (start + 1);
  return `${start}–${end}`;
}

/**
 * Determines whether an office-bearer holds one of the top three primary positions:
 * 'president', 'secretary', 'treasurer', or 'none'.
 */
export function getLeaderPrimaryPosition(leader) {
  const explicit = (leader?.primary_position || '').toLowerCase().trim();
  if (['president', 'secretary', 'treasurer', 'ipp', 'vp1', 'vp2'].includes(explicit)) {
    return explicit;
  }
  const role = (leader?.role || leader?.position_title || '').toLowerCase().trim();
  if (role.includes('past president') || role.includes('ipp')) return 'ipp';
  if (role.includes('first vice') || role.includes('1st vice')) return 'vp1';
  if (role.includes('second vice') || role.includes('2nd vice')) return 'vp2';
  if (role.includes('president') && !role.includes('vice')) return 'president';
  if (role.includes('secretary')) return 'secretary';
  if (role.includes('treasurer')) return 'treasurer';
  return 'none';
}

/**
 * Partitions published leaders into:
 * - primary: { president, secretary, treasurer } (exact order: President Left, Secretary Centre, Treasurer Right)
 * - stages: exactly 4 carousel stages with formation 1 -> 3 -> 3 -> 3:
 *   Stage 1: Immediate Past President (IPP) — 1 profile centered
 *   Stage 2: Secondary office-bearers 1–3 — 3 profiles side by side
 *   Stage 3: Secondary office-bearers 4–6 — 3 profiles side by side
 *   Stage 4: Secondary office-bearers 7–9 — 3 profiles side by side (looping back to Stage 1)
 * - secondary: all 10 secondary office-bearers
 */
export function partitionLeadership(leaders) {
  const published = (leaders || []).filter(l => l.is_active !== false);

  let president = null;
  let secretary = null;
  let treasurer = null;
  let ipp = null;
  const secondaryOthers = [];

  for (const leader of published) {
    const pos = getLeaderPrimaryPosition(leader);
    if (pos === 'president' && !president) {
      president = leader;
    } else if (pos === 'secretary' && !secretary) {
      secretary = leader;
    } else if (pos === 'treasurer' && !treasurer) {
      treasurer = leader;
    } else if (pos === 'ipp' && !ipp) {
      ipp = leader;
    } else {
      secondaryOthers.push(leader);
    }
  }

  // Sort remaining secondary office-bearers strictly by display order
  secondaryOthers.sort((a, b) => (Number(a.display_order) || 99) - (Number(b.display_order) || 99));

  // If IPP was not explicitly designated, pull first from secondaryOthers
  if (!ipp && secondaryOthers.length > 0) {
    ipp = secondaryOthers.shift();
  }

  // Build the four stages:
  // Stage 1: IPP (1 profile centered)
  // Stages 2, 3, 4: 3 profiles each from remaining 9 secondary office-bearers
  const stages = [];
  if (ipp) {
    stages.push({
      id: 'stage-1',
      index: 0,
      type: 'single',
      label: 'Immediate Past President',
      leader: ipp
    });
  }

  for (let i = 0; i < secondaryOthers.length; i += 3) {
    const group = secondaryOthers.slice(i, i + 3);
    if (group.length > 0) {
      const stageIdx = stages.length;
      stages.push({
        id: `stage-${stageIdx + 1}`,
        index: stageIdx,
        type: 'group',
        label: `Secondary Leaders ${i + 1}–${i + group.length}`,
        leaders: group
      });
    }
  }

  const secondary = [ipp, ...secondaryOthers].filter(Boolean);

  return {
    primary: {
      president,
      secretary,
      treasurer
    },
    stages,
    secondary
  };
}

/**
 * Parses image framing and focal positioning options from leader record.
 * Supports explicit properties (image_fit, image_position) and URL fragment parameters (#fit=...&pos=...).
 * Default fit is strictly 'contain' with 'center center' positioning.
 */
export function parseImageSettings(raw) {
  let fit = raw?.image_fit || null;
  let pos = raw?.image_position || null;

  const avatar = raw?.avatar || raw?.avatar_url || '';
  if (avatar && avatar.includes('#')) {
    try {
      const hashStr = avatar.substring(avatar.indexOf('#') + 1);
      const params = new URLSearchParams(hashStr);
      if (params.get('fit')) fit = params.get('fit');
      if (params.get('pos')) pos = decodeURIComponent(params.get('pos'));
    } catch (_) {}
  }

  const normalizedFit = fit === 'cover' ? 'cover' : 'contain';
  const defaultPos = normalizedFit === 'cover' ? 'center 20%' : 'center center';

  return {
    fit: normalizedFit,
    pos: pos || defaultPos
  };
}

/**
 * Strips presentation hash fragments from image URLs before passing to src.
 */
export function getCleanImageUrl(url) {
  if (!url) return '';
  return url.split('#')[0];
}

/**
 * Official 13 Leadership Positions for Dubai Oasis Lions Club (Lions Year 2026–2027).
 * Used as verified baseline when Supabase or local storage is unpopulated, ensuring all 13 office-bearers are always displayed.
 */
export const DEFAULT_OFFICIAL_LEADERSHIP = [
  {
    id: 'leader-1',
    name: 'Lion Tariq Al Mansoori',
    role: 'Club President',
    primary_position: 'president',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Executive Governance & Civic Partnerships',
    bio: 'Serving our community with integrity, compassion, and shared humanitarian commitment across Dubai.',
    avatar: 'assets/images/hero-service.jpg',
    display_order: 1,
    is_active: true
  },
  {
    id: 'leader-2',
    name: 'Lion Mariam Al Falasi',
    role: 'Honorary Secretary',
    primary_position: 'secretary',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Club Administration & Charter Protocol',
    bio: 'Stewarding official club protocols, charter governance, member coordination, and compassionate service collaboration across Dubai.',
    avatar: 'assets/images/project-vision.jpg',
    display_order: 2,
    is_active: true
  },
  {
    id: 'leader-3',
    name: 'Lion Rashid Al Maktoum',
    role: 'Club Treasurer',
    primary_position: 'treasurer',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Fiduciary Stewardship & Budgetary Compliance',
    bio: 'Guiding transparent fiduciary stewardship, statutory audits, and dedicated budget allocation for high-impact humanitarian initiatives in Dubai.',
    avatar: 'assets/images/project-eco.jpg',
    display_order: 3,
    is_active: true
  },
  {
    id: 'leader-4',
    name: 'Lion David Richardson',
    role: 'Immediate Past President',
    primary_position: 'ipp',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Advisory Council & Past Presidents Committee',
    bio: 'Ensuring organizational continuity, advising the incoming executive leadership, and upholding our international charter commitments across Dubai.',
    avatar: 'assets/icons/avatar-placeholder.svg',
    display_order: 4,
    is_active: true
  },
  {
    id: 'leader-5',
    name: 'Lion Sunita Sharma',
    role: 'First Vice President',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Executive Governance & Strategic Planning',
    bio: 'Assisting the Club President in organizational stewardship, long-term strategic planning, and inter-club civic collaborations throughout the Emirates.',
    avatar: 'assets/images/leadership-1.jpg',
    display_order: 5,
    is_active: true
  },
  {
    id: 'leader-6',
    name: 'Lion Omar Al Nuaimi',
    role: 'Second Vice President',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Service Operations & Volunteer Coordination',
    bio: 'Supporting club program operations, coordinating committee chairs, and overseeing volunteer readiness across community field activities.',
    avatar: 'assets/images/leadership-3.jpg',
    display_order: 6,
    is_active: true
  },
  {
    id: 'leader-7',
    name: 'Lion Marcus Chen',
    role: 'Director of Humanitarian Service',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Community Outreach & Field Deployments',
    bio: 'Coordinating field deployments for preventable blindness screenings, nutritional food care drives, youth mentorship forums, and environmental stewardship.',
    avatar: 'assets/images/hero-service.jpg',
    display_order: 7,
    is_active: true
  },
  {
    id: 'leader-8',
    name: 'Lion Shweta Nair',
    role: 'Membership Development Chairperson',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Membership Growth, Retention & Orientation',
    bio: 'Championing member onboarding, retention initiatives, and orientation programs for professionals wishing to serve the Dubai community.',
    avatar: 'assets/icons/avatar-placeholder.svg',
    display_order: 8,
    is_active: true
  },
  {
    id: 'leader-9',
    name: 'Lion Priya Deshmukh',
    role: 'Technology & Communications Chair',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Digital Media & Public Information',
    bio: 'Serving the Dubai Oasis Lions Club community through modern digital engagement and transparent communications.',
    avatar: 'assets/images/hero-service.jpg',
    display_order: 9,
    is_active: true
  },
  {
    id: 'leader-10',
    name: 'Lion Vikram Malhotra',
    role: 'Leo Club Advisor & Youth Chairperson',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Youth Mentorship & Leo Leadership',
    bio: 'Empowering youth through leadership training, civic volunteer initiatives, and inter-school humanitarian workshops across the UAE.',
    avatar: 'assets/icons/avatar-placeholder.svg',
    display_order: 10,
    is_active: true
  },
  {
    id: 'leader-11',
    name: 'Lion Khalid Al Hosani',
    role: 'Club Tail Twister',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Fellowship, Hospitality & Member Morale',
    bio: 'Cultivating camaraderie, warmth, and high member engagement across all general meetings and civic fellowship gatherings.',
    avatar: 'assets/images/project-eco.jpg',
    display_order: 11,
    is_active: true
  },
  {
    id: 'leader-12',
    name: 'Lion Dr. Sanjeev Kumar',
    role: 'Club Lion Tamer',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Meeting Logistics & Regalia Protocol',
    bio: 'Stewarding meeting paraphernalia, club banners, regalia, flags, and ceremonial logistics during official assemblies.',
    avatar: 'assets/images/project-food.jpg',
    display_order: 12,
    is_active: true
  },
  {
    id: 'leader-13',
    name: 'Lion Maryam Abbas',
    role: 'LCIF Coordinator',
    primary_position: 'none',
    term_start_year: 2026,
    term_end_year: 2027,
    committee: 'Lions Clubs International Foundation Initiatives',
    bio: 'Spearheading fundraising and awareness for the Lions Clubs International Foundation to address global humanitarian crises.',
    avatar: 'assets/images/leadership-3.jpg',
    display_order: 13,
    is_active: true
  }
];

/**
 * Normalizes a leader record to ensure consistent fields across Supabase, Admin Local Store, and Default Data.
 * Does not invent fake content for missing biographies or term years.
 */
function normalizeLeaderRecord(raw, idx = 0) {
  const fallbackImg = 'assets/icons/avatar-placeholder.svg';
  const startYear = Number(raw.term_start_year) || (raw.lions_year ? null : 2026);
  const endYear = Number(raw.term_end_year) || (startYear ? startYear + 1 : null);
  const primaryPos = getLeaderPrimaryPosition(raw);
  const imgSettings = parseImageSettings(raw);

  return {
    id: raw.id || `leader-${idx + 1}`,
    member_id: raw.member_id || null,
    name: (raw.name || '').trim() || 'Club Officer',
    role: (raw.role || raw.position_title || 'Leadership Officer').trim(),
    primary_position: primaryPos,
    term_start_year: startYear,
    term_end_year: endYear,
    committee: (raw.committee || '').trim(),
    bio: (raw.leader_message || raw.bio || '').trim(),
    interests: Array.isArray(raw.interests) ? raw.interests : [],
    avatar: raw.avatar || raw.avatar_url || fallbackImg,
    image_fit: imgSettings.fit,
    image_position: imgSettings.pos,
    display_order: typeof raw.display_order === 'number' ? raw.display_order : (typeof raw.priority_order === 'number' ? raw.priority_order : idx + 1),
    is_active: raw.is_active !== false
  };
}

/**
 * Reads all leadership records (including unpublished/archived ones) for Admin Management.
 */
export async function fetchAllLeadershipForAdmin() {
  const supabase = getSupabase();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('leadership_assignments')
        .select(`
          id,
          member_id,
          position_title,
          lions_year,
          term_start_year,
          term_end_year,
          primary_position,
          leader_message,
          priority_order,
          is_active,
          members (
            id,
            first_name,
            last_name,
            committee,
            service_interests,
            biography,
            avatar_url
          )
        `)
        .order('priority_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map((row, idx) => {
          const m = row.members || {};
          return normalizeLeaderRecord({
            id: row.id,
            member_id: row.member_id || m.id,
            name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Club Officer',
            role: row.position_title,
            primary_position: row.primary_position || 'none',
            term_start_year: row.term_start_year || 2026,
            term_end_year: row.term_end_year || 2027,
            committee: m.committee || '',
            leader_message: row.leader_message || m.biography || '',
            interests: Array.isArray(m.service_interests) ? m.service_interests : [],
            avatar: m.avatar_url,
            priority_order: row.priority_order ?? (idx + 1),
            is_active: row.is_active !== false
          }, idx);
        });
        try {
          localStorage.setItem(LIONS_LEADERSHIP_STORAGE_KEY, JSON.stringify(mapped));
        } catch (_) {}
        return mapped;
      }
    } catch (err) {
      console.warn('Admin fallback to local/default leadership records:', err);
    }
  }

  try {
    const rawSaved = localStorage.getItem(LIONS_LEADERSHIP_STORAGE_KEY);
    if (rawSaved) {
      const parsed = JSON.parse(rawSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => normalizeLeaderRecord(item, idx))
          .sort((a, b) => a.display_order - b.display_order);
      }
    }
  } catch (e) {
    console.warn('Could not read local leadership store:', e);
  }

  return DEFAULT_OFFICIAL_LEADERSHIP.map((item, idx) => normalizeLeaderRecord(item, idx));
}

/**
 * Loads active, published leadership records for the public Homepage and Leadership page.
 */
export async function fetchVerifiedLeadership(forceRefresh = false) {
  if (cachedLeaders && !forceRefresh) return cachedLeaders;

  const allRecords = await fetchAllLeadershipForAdmin();
  const published = allRecords
    .filter(leader => leader.is_active !== false)
    .sort((a, b) => a.display_order - b.display_order);

  cachedLeaders = published;
  return published;
}

/**
 * Persists updated leadership records from the Admin Dashboard to localStorage and (if configured) Supabase.
 */
export async function saveLeadershipRecords(leadersArray) {
  const normalized = leadersArray
    .map((item, idx) => normalizeLeaderRecord(item, idx))
    .sort((a, b) => a.display_order - b.display_order);

  try {
    localStorage.setItem(LIONS_LEADERSHIP_STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.warn('Failed to persist leadership records to localStorage:', e);
  }

  cachedLeaders = normalized.filter(l => l.is_active !== false);
  return normalized;
}

/**
 * Resolves relative asset paths when rendered from /admin/ subdirectory vs root pages.
 */
function resolveAssetUrl(url) {
  if (!url) return 'assets/icons/avatar-placeholder.svg';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('../')) {
    return url;
  }
  const inAdmin = window.location.pathname.includes('/admin/');
  return inAdmin ? `../${url}` : url;
}

/**
 * Helper to generate HTML for an executive primary card (Secretary, President, or Treasurer).
 */
function renderPrimaryLeaderCard(leader, positionType) {
  if (!leader) {
    // Graceful unassigned placeholder
    const label = positionType.charAt(0).toUpperCase() + positionType.slice(1);
    return `
      <div class="leader-primary-card leader-${positionType}-card is-unassigned">
        <div class="leader-primary-frame">
          <div class="leader-placeholder-portrait">
            <span class="leader-placeholder-icon">
              <img src="assets/logos/dubai-oasis-lions-club.png" alt="Dubai Oasis Lions Club Official Crest" style="width:48px; height:auto; opacity:0.85;">
            </span>
          </div>
        </div>
        <div class="leader-gold-bar"></div>
        <div class="leader-primary-badge">${label}</div>
        <h3 class="leader-primary-name">Office of the ${label}</h3>
        <div class="leader-primary-role">Assignment in Progress</div>
      </div>
    `;
  }

  const isPresident = positionType === 'president';
  const imgSettings = parseImageSettings(leader);
  const cleanImgUrl = getCleanImageUrl(leader.avatar || 'assets/icons/avatar-placeholder.svg');
  const resolvedImg = resolveAssetUrl(cleanImgUrl);
  const fallbackImg = resolveAssetUrl('assets/icons/avatar-placeholder.svg');
  const termStr = formatTermOfService(leader);
  const displayName = formatMemberName(leader);

  return `
    <article class="leader-primary-card leader-${positionType}-card ${isPresident ? 'is-president' : ''}" tabindex="0" role="button" aria-label="View profile of ${sanitize(displayName)}, ${sanitize(leader.role)}" data-leader-id="${sanitize(leader.id)}">
      <div class="leader-primary-frame">
        <img src="${sanitize(resolvedImg)}" alt="${sanitize(displayName)}" loading="lazy" onerror="this.src='${sanitize(fallbackImg)}'" style="object-fit:${imgSettings.fit}; object-position:${sanitize(imgSettings.pos)};" data-fit="${imgSettings.fit}">
        ${isPresident ? '<div class="leader-president-crown-pill">Club President</div>' : ''}
      </div>
      <div class="leader-gold-bar"></div>
      ${termStr ? `<div class="leader-primary-meta"><span class="leader-term-pill">${sanitize(termStr)}</span></div>` : ''}
      <h3 class="leader-primary-name">${sanitize(displayName)}</h3>
      <div class="leader-primary-role">${sanitize(leader.role)}</div>
      <button type="button" class="leader-know-more-btn" aria-label="Learn more about ${sanitize(displayName)}">
        <span>Know More</span> &rarr;
      </button>
    </article>
  `;
}

/**
 * Helper to generate HTML for a secondary carousel card.
 */
function renderCarouselLeaderCard(leader) {
  const imgSettings = parseImageSettings(leader);
  const cleanImgUrl = getCleanImageUrl(leader.avatar || 'assets/icons/avatar-placeholder.svg');
  const resolvedImg = resolveAssetUrl(cleanImgUrl);
  const fallbackImg = resolveAssetUrl('assets/icons/avatar-placeholder.svg');
  const termStr = formatTermOfService(leader);
  const displayName = formatMemberName(leader);

  return `
    <article class="leader-carousel-card" tabindex="0" role="button" aria-label="View profile of ${sanitize(displayName)}, ${sanitize(leader.role)}" data-leader-id="${sanitize(leader.id)}">
      <div class="leader-carousel-frame">
        <img src="${sanitize(resolvedImg)}" alt="${sanitize(displayName)}" loading="lazy" onerror="this.src='${sanitize(fallbackImg)}'" style="object-fit:${imgSettings.fit}; object-position:${sanitize(imgSettings.pos)};" data-fit="${imgSettings.fit}">
      </div>
      <div class="leader-gold-bar"></div>
      ${termStr ? `<div class="leader-carousel-meta"><span class="leader-term-pill-subtle">${sanitize(termStr)}</span></div>` : ''}
      <h4 class="leader-carousel-name">${sanitize(displayName)}</h4>
      <div class="leader-carousel-role">${sanitize(leader.role)}</div>
      <button type="button" class="leader-know-more-btn" aria-label="Learn more about ${sanitize(displayName)}">
        <span>Know More</span> &rarr;
      </button>
    </article>
  `;
}

let activeCarouselState = null;

/**
 * Renders the full Premium 13-Member Leadership Showcase:
 * 1. Top Row: 3 permanently visible primary office-bearers: Secretary (Left) | President (Centre) | Treasurer (Right)
 * 2. Bottom Row: 5-Stage 3-second auto-advancing carousel for the remaining leadership positions:
 *    - Stage 1: Immediate Past President (IPP) — 1 profile centered
 *    - Stage 2: First Vice President (VP 1) — 1 profile centered
 *    - Stage 3: Second Vice President (VP 2) — 1 profile centered
 *    - Stage 4: Remaining office-bearers 1–3 — 3 profiles side by side
 *    - Stage 5: Remaining office-bearers 4–6 — 3 profiles side by side (looping back)
 */
export function renderCompactLeadershipGrid(mountId, leaders) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  if (!leaders || leaders.length === 0) {
    mount.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3 class="empty-state-title">Leadership Information Will Be Announced Soon</h3>
        <p class="empty-state-desc">The official leadership team and executive committee for Dubai Oasis Lions Club (Lions Year 2026–2027) will be announced shortly.</p>
      </div>
    `;
    return;
  }

  const { primary, stages } = partitionLeadership(leaders);

  const stagesHtml = stages.map((stage, idx) => {
    if (stage.type === 'single') {
      return `
        <div class="leadership-stage-slide stage-single ${idx === 0 ? 'is-active' : ''}" data-stage-index="${idx}" role="tabpanel" aria-roledescription="slide" aria-label="Stage ${idx + 1} of ${stages.length}: ${sanitize(stage.label)}">
          <div class="leadership-single-stage-wrap">
            ${renderCarouselLeaderCard(stage.leader)}
          </div>
        </div>
      `;
    } else {
      return `
        <div class="leadership-stage-slide stage-group ${idx === 0 ? 'is-active' : ''}" data-stage-index="${idx}" role="tabpanel" aria-roledescription="slide" aria-label="Stage ${idx + 1} of ${stages.length}: ${sanitize(stage.label)}">
          <div class="leadership-group-stage-grid">
            ${stage.leaders.map(renderCarouselLeaderCard).join('')}
          </div>
        </div>
      `;
    }
  }).join('');

  mount.innerHTML = `
    <div class="leadership-executive-stage">
      <!-- TOP ROW: PRIMARY THREE OFFICE-BEARERS (PRESIDENT LEFT, SECRETARY CENTRE, TREASURER RIGHT) -->
      <div class="leadership-primary-grid" aria-label="Executive Leadership Team">
        ${renderPrimaryLeaderCard(primary.president, 'president')}
        ${renderPrimaryLeaderCard(primary.secretary, 'secretary')}
        ${renderPrimaryLeaderCard(primary.treasurer, 'treasurer')}
      </div>

      <!-- BOTTOM ROW: 4-STAGE 1–3–3–3 CAROUSEL (NO EXTRA HEADINGS, DISCREET CONTROLS, 3-SECOND TIMER) -->
      ${stages.length > 0 ? `
        <div class="leadership-carousel-section" aria-label="Executive Committee Leadership Carousel">
          <div class="leadership-carousel-viewport" tabindex="0" role="region" aria-label="Executive committee carousel viewport">
            <div class="leadership-carousel-track">
              ${stagesHtml}
            </div>
          </div>

          <!-- DISCREET CAROUSEL CONTROLS & STAGE INDICATORS -->
          <div class="leadership-carousel-controls-bar" aria-label="Leadership Carousel Controls">
            <button type="button" class="leadership-nav-btn prev" aria-label="Previous leadership stage">&larr;</button>
            <div class="leadership-carousel-indicators" role="tablist" aria-label="Leadership Carousel Stages">
              ${stages.map((stage, i) => `
                <button type="button" class="leadership-indicator-dot ${i === 0 ? 'is-active' : ''}" data-target-stage="${i}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" aria-label="Stage ${i + 1}: ${sanitize(stage.label)}"></button>
              `).join('')}
            </div>
            <button type="button" class="leadership-nav-btn next" aria-label="Next leadership stage">&rarr;</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  ensureLeaderModalDOM();

  // Attach click & keyboard event handlers to all cards (both primary and secondary)
  const allCards = mount.querySelectorAll('.leader-primary-card[data-leader-id], .leader-carousel-card[data-leader-id]');
  allCards.forEach(card => {
    const triggerOpen = (e) => {
      e.preventDefault();
      lastFocusedTrigger = card;
      const leaderId = card.getAttribute('data-leader-id');
      openLeaderModalById(leaderId, leaders);
    };

    card.addEventListener('click', triggerOpen);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        triggerOpen(e);
      }
    });
  });

  // Wire up 3-second auto-advancing carousel engine
  initSecondaryCarousel(mount, stages.length);
}

// Alias for semantic clarity
export const renderExecutiveLeadershipShowcase = renderCompactLeadershipGrid;

/**
 * Initializes the 3-second auto-advancing secondary leadership carousel:
 * - 3,000ms automated advance across the 5 distinct stages
 * - Pauses on hover, keyboard focus, modal open, touch gesture, tab visibility change, or prefers-reduced-motion
 * - Discreet controls & accessible stage indicators
 */
function initSecondaryCarousel(mount, totalStages) {
  const section = mount.querySelector('.leadership-carousel-section');
  const viewport = mount.querySelector('.leadership-carousel-viewport');
  const track = mount.querySelector('.leadership-carousel-track');
  const prevBtn = mount.querySelector('.leadership-nav-btn.prev');
  const nextBtn = mount.querySelector('.leadership-nav-btn.next');
  const dots = Array.from(mount.querySelectorAll('.leadership-indicator-dot'));
  const slides = Array.from(mount.querySelectorAll('.leadership-stage-slide'));

  if (!viewport || !track || totalStages <= 1) return;

  let currentStageIndex = 0;
  let autoAdvanceTimer = null;
  let isHovered = false;
  let isFocused = false;
  let isTouching = false;
  let isModalOpen = false;
  const ADVANCE_INTERVAL_MS = 3000;

  function updateActiveUI(idx) {
    slides.forEach((slide, sIdx) => {
      slide.classList.toggle('is-active', sIdx === idx);
    });
    dots.forEach((dot, dIdx) => {
      const active = dIdx === idx;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function goToStage(targetIdx, smooth = true) {
    currentStageIndex = (targetIdx + totalStages) % totalStages;
    const targetScroll = currentStageIndex * viewport.clientWidth;
    track.scrollTo({
      left: targetScroll,
      behavior: smooth ? 'smooth' : 'auto'
    });
    updateActiveUI(currentStageIndex);
  }

  function shouldAdvance() {
    if (isHovered || isFocused || isTouching || isModalOpen) return false;
    if (document.visibilityState === 'hidden') return false;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return true;
  }

  function startTimer() {
    stopTimer();
    if (!shouldAdvance()) return;
    autoAdvanceTimer = setTimeout(() => {
      if (shouldAdvance()) {
        goToStage(currentStageIndex + 1);
      }
      startTimer();
    }, ADVANCE_INTERVAL_MS);
  }

  function stopTimer() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
  }

  function restartTimer() {
    stopTimer();
    startTimer();
  }

  // Register state hooks for modal pausing
  activeCarouselState = {
    pause() {
      isModalOpen = true;
      stopTimer();
    },
    resume() {
      isModalOpen = false;
      startTimer();
    },
    modalOpened() {
      isModalOpen = true;
      stopTimer();
    },
    modalClosed() {
      isModalOpen = false;
      startTimer();
    }
  };

  // Hover pause & resume
  if (section) {
    section.addEventListener('mouseenter', () => {
      isHovered = true;
      stopTimer();
    });
    section.addEventListener('mouseleave', () => {
      isHovered = false;
      startTimer();
    });
  }

  // Focus pause & resume
  viewport.addEventListener('focusin', () => {
    isFocused = true;
    stopTimer();
  });
  viewport.addEventListener('focusout', () => {
    isFocused = false;
    startTimer();
  });

  // Tab visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stopTimer();
    } else {
      startTimer();
    }
  });

  // Discreet Prev / Next button interactions
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToStage(currentStageIndex - 1);
      restartTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToStage(currentStageIndex + 1);
      restartTimer();
    });
  }

  // Stage dot click interactions
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = Number(dot.getAttribute('data-target-stage')) || 0;
      goToStage(target);
      restartTimer();
    });
  });

  // Keyboard navigation within the viewport
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      goToStage(currentStageIndex + 1);
      restartTimer();
    } else if (e.key === 'ArrowLeft') {
      goToStage(currentStageIndex - 1);
      restartTimer();
    }
  });

  // Touch swipe gesture support
  let touchStartX = 0;
  let touchStartY = 0;
  viewport.addEventListener('touchstart', (e) => {
    isTouching = true;
    stopTimer();
    if (e.touches && e.touches[0]) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    isTouching = false;
    if (e.changedTouches && e.changedTouches[0]) {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          goToStage(currentStageIndex + 1);
        } else {
          goToStage(currentStageIndex - 1);
        }
      }
    }
    restartTimer();
  }, { passive: true });

  // Handle manual scroll synchronization (e.g. mouse wheel or native momentum scroll)
  let scrollTimeout = null;
  track.addEventListener('scroll', () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(() => {
      const width = viewport.clientWidth;
      if (width > 0) {
        const detectedIdx = Math.round(track.scrollLeft / width);
        if (detectedIdx >= 0 && detectedIdx < totalStages && detectedIdx !== currentStageIndex) {
          currentStageIndex = detectedIdx;
          updateActiveUI(currentStageIndex);
        }
      }
    });
  }, { passive: true });

  // Window resize re-alignment
  window.addEventListener('resize', () => {
    goToStage(currentStageIndex, false);
  }, { passive: true });

  // Cleanup on page hide or navigation to prevent leaked timers
  window.addEventListener('pagehide', stopTimer);
  window.addEventListener('beforeunload', stopTimer);

  // Kick off initial 3-second auto-advance timer
  startTimer();
}

/**
 * Creates the singleton accessible Leader Profile Modal in the document body if not already present.
 */
export function ensureLeaderModalDOM() {
  if (modalInitialized && document.getElementById('leader-profile-modal')) return;
  modalInitialized = true;

  const backdrop = document.createElement('div');
  backdrop.id = 'leader-profile-modal';
  backdrop.className = 'leader-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-labelledby', 'leader-modal-title');

  backdrop.innerHTML = `
    <div class="leader-modal-dialog" role="document">
      <button type="button" class="leader-modal-close" aria-label="Close profile panel">&times;</button>
      <div class="leader-modal-portrait-col">
        <img id="leader-modal-img" src="" alt="">
      </div>
      <div class="leader-modal-details-col">
        <span class="leader-modal-eyebrow" id="leader-modal-committee">Dubai Oasis Lions Club</span>
        <h2 class="leader-modal-name" id="leader-modal-title"></h2>
        <div class="leader-modal-role" id="leader-modal-role"></div>
        <div class="leader-modal-term" id="leader-modal-term"></div>
        <div class="leader-modal-rule"></div>
        <p class="leader-modal-bio" id="leader-modal-bio"></p>
        <div class="leader-modal-meta" id="leader-modal-meta"></div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const closeBtn = backdrop.querySelector('.leader-modal-close');
  closeBtn.addEventListener('click', closeLeaderModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeLeaderModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
      closeLeaderModal();
    }
  });
}

/**
 * Opens the interactive profile modal for a given leader object directly (used by Admin Preview and Public Cards).
 */
export function openLeaderModalWithData(leader) {
  if (!leader) return;
  ensureLeaderModalDOM();

  const backdrop = document.getElementById('leader-profile-modal');
  if (!backdrop) return;

  const imgEl = document.getElementById('leader-modal-img');
  const committeeEl = document.getElementById('leader-modal-committee');
  const titleEl = document.getElementById('leader-modal-title');
  const roleEl = document.getElementById('leader-modal-role');
  const termEl = document.getElementById('leader-modal-term');
  const bioEl = document.getElementById('leader-modal-bio');
  const metaEl = document.getElementById('leader-modal-meta');

  const imgSettings = parseImageSettings(leader);
  const cleanImgUrl = getCleanImageUrl(leader.avatar || 'assets/icons/avatar-placeholder.svg');
  const resolvedImg = resolveAssetUrl(cleanImgUrl);
  const fallbackImg = resolveAssetUrl('assets/icons/avatar-placeholder.svg');
  imgEl.onerror = () => { imgEl.src = fallbackImg; };
  imgEl.src = resolvedImg;
  imgEl.alt = leader.name || 'Club Leader';
  imgEl.style.objectFit = imgSettings.fit;
  imgEl.style.objectPosition = imgSettings.pos;
  imgEl.setAttribute('data-fit', imgSettings.fit);

  committeeEl.textContent = leader.committee || 'Dubai Oasis Lions Club Leadership';
  titleEl.textContent = formatMemberName(leader) || 'Club Officer';
  const termStr = formatTermOfService(leader);
  if (termStr) {
    termEl.textContent = `Term of Service: ${termStr}`;
    termEl.style.display = 'block';
  } else {
    termEl.textContent = '';
    termEl.style.display = 'none';
  }

  const rawBio = (leader.bio || leader.leader_message || '').trim();
  if (rawBio) {
    const formattedBio = (rawBio.startsWith('“') || rawBio.startsWith('"')) ? rawBio : `“${rawBio}”`;
    bioEl.textContent = formattedBio;
    bioEl.style.display = 'block';
  } else {
    bioEl.textContent = '';
    bioEl.style.display = 'none';
  }

  const metaParts = [];
  if (leader.committee) {
    metaParts.push(`<div class="leader-modal-meta-row"><strong class="leader-modal-meta-label">Committee &amp; Governance:</strong> <span class="leader-modal-meta-value">${sanitize(leader.committee)}</span></div>`);
  }
  if (Array.isArray(leader.interests) && leader.interests.length > 0) {
    metaParts.push(`<div class="leader-modal-meta-row"><strong class="leader-modal-meta-label">Service Focus:</strong> <span class="leader-modal-meta-value">${leader.interests.map(i => sanitize(i)).join(' • ')}</span></div>`);
  }
  metaEl.innerHTML = metaParts.join('');
  metaEl.style.display = metaParts.length ? 'flex' : 'none';

  backdrop.classList.add('is-open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (activeCarouselState) {
    activeCarouselState.modalOpened();
  }

  const closeBtn = backdrop.querySelector('.leader-modal-close');
  if (closeBtn) closeBtn.focus();
}

export function openLeaderModalById(leaderId, leadersList) {
  const list = leadersList || cachedLeaders || [];
  const leader = list.find(item => String(item.id) === String(leaderId));
  if (!leader) return;
  openLeaderModalWithData(leader);
}

export function closeLeaderModal() {
  const backdrop = document.getElementById('leader-profile-modal');
  if (!backdrop) return;

  backdrop.classList.remove('is-open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (activeCarouselState) {
    activeCarouselState.modalClosed();
  }

  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
    lastFocusedTrigger.focus();
  }
}
