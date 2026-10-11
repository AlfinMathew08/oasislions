// Shared Leadership Data Loader, Compact Showcase Renderer & Interactive Profile Modal
// Used by both Homepage (index.html) and Dedicated Leadership Page (leadership.html)

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { DEFAULT_PUBLIC_DATA } from './public-data.js';
import { sanitize } from './utils.js';

let cachedLeaders = null;
let modalInitialized = false;
let lastFocusedTrigger = null;

/**
 * Loads verified leadership records from Supabase (if configured) or falls back to
 * the single authoritative verified dataset in DEFAULT_PUBLIC_DATA.leadership.
 */
export async function fetchVerifiedLeadership() {
  if (cachedLeaders) return cachedLeaders;

  let leaders = [...DEFAULT_PUBLIC_DATA.leadership];
  const supabase = getSupabase();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('leadership_assignments')
        .select(`
          id,
          position_title,
          lions_year,
          priority_order,
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
        .eq('is_active', true)
        .order('priority_order', { ascending: true });

      if (!error && data && data.length > 0) {
        leaders = data.map((row, idx) => {
          const m = row.members || {};
          const fallbackImg = DEFAULT_PUBLIC_DATA.leadership[idx % DEFAULT_PUBLIC_DATA.leadership.length]?.avatar || 'assets/images/leadership-1.jpg';
          return {
            id: row.id || m.id || `leader-${idx}`,
            name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Club Officer',
            role: row.position_title || 'Leadership Officer',
            committee: m.committee || 'Executive Governance',
            bio: m.biography || 'Dedicated office bearer stewarding Dubai Oasis Lions Club humanitarian initiatives.',
            interests: Array.isArray(m.service_interests) ? m.service_interests : [],
            avatar: m.avatar_url || fallbackImg
          };
        });
      }
    } catch (err) {
      console.warn('Using verified fallback leadership records:', err);
    }
  }

  cachedLeaders = leaders;
  return leaders;
}

/**
 * Renders the compact, high-end portrait grid into a target container and wires up
 * click & keyboard handlers to open the corresponding leader's profile modal.
 */
export function renderCompactLeadershipGrid(mountId, leaders) {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  if (!leaders || leaders.length === 0) {
    mount.innerHTML = `
      <div class="empty-state">
        <p class="empty-state-title">Leadership Roster Updating</p>
        <p class="empty-state-desc">Official leadership portraits and biographies are being updated by club administration.</p>
      </div>
    `;
    return;
  }

  mount.innerHTML = leaders.map(leader => `
    <article class="leader-compact-item" tabindex="0" role="button" aria-label="View profile of ${sanitize(leader.name)}, ${sanitize(leader.role)}" data-leader-id="${sanitize(leader.id)}">
      <div class="leader-portrait-frame">
        <img src="${sanitize(leader.avatar || 'assets/images/leadership-1.jpg')}" alt="${sanitize(leader.name)}" loading="lazy" onerror="this.src='assets/images/leadership-1.jpg'">
      </div>
      <div class="leader-gold-bar"></div>
      <h3 class="leader-compact-name">${sanitize(leader.name)}</h3>
      <div class="leader-compact-role">${sanitize(leader.role)}</div>
      <span class="leader-know-more-btn">Know More &rarr;</span>
    </article>
  `).join('');

  ensureLeaderModalDOM(leaders);

  const cards = mount.querySelectorAll('.leader-compact-item');
  cards.forEach(card => {
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
}

/**
 * Creates the singleton accessible Leader Profile Modal in the document body if not already present.
 */
function ensureLeaderModalDOM() {
  if (modalInitialized) return;
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
        <img id="leader-modal-img" src="assets/images/leadership-1.jpg" alt="">
      </div>
      <div class="leader-modal-details-col">
        <span class="leader-modal-eyebrow" id="leader-modal-committee">Leadership Profile</span>
        <h2 class="leader-modal-name" id="leader-modal-title"></h2>
        <div class="leader-modal-role" id="leader-modal-role"></div>
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

export function openLeaderModalById(leaderId, leadersList) {
  const list = leadersList || cachedLeaders || DEFAULT_PUBLIC_DATA.leadership;
  const leader = list.find(item => String(item.id) === String(leaderId));
  if (!leader) return;

  const backdrop = document.getElementById('leader-profile-modal');
  if (!backdrop) return;

  const imgEl = document.getElementById('leader-modal-img');
  const committeeEl = document.getElementById('leader-modal-committee');
  const titleEl = document.getElementById('leader-modal-title');
  const roleEl = document.getElementById('leader-modal-role');
  const bioEl = document.getElementById('leader-modal-bio');
  const metaEl = document.getElementById('leader-modal-meta');

  imgEl.src = leader.avatar || 'assets/images/leadership-1.jpg';
  imgEl.alt = leader.name;
  committeeEl.textContent = leader.committee || 'Dubai Oasis Lions Club Leadership';
  titleEl.textContent = leader.name;
  roleEl.textContent = leader.role;
  bioEl.textContent = leader.bio || 'Dedicated office bearer guiding community service initiatives in Dubai.';

  const metaParts = [];
  if (leader.committee) {
    metaParts.push(`<div><strong>Committee:</strong> ${sanitize(leader.committee)}</div>`);
  }
  if (Array.isArray(leader.interests) && leader.interests.length > 0) {
    metaParts.push(`<div><strong>Service Focus:</strong> ${leader.interests.map(i => sanitize(i)).join(' • ')}</div>`);
  }
  metaEl.innerHTML = metaParts.join('');
  metaEl.style.display = metaParts.length ? 'flex' : 'none';

  backdrop.classList.add('is-open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = backdrop.querySelector('.leader-modal-close');
  if (closeBtn) closeBtn.focus();
}

export function closeLeaderModal() {
  const backdrop = document.getElementById('leader-profile-modal');
  if (!backdrop) return;

  backdrop.classList.remove('is-open');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
    lastFocusedTrigger.focus();
  }
}
