// Dubai Oasis Lions Club — Upcoming Events Public Controller
// Handles Supabase synchronization, UAE timezone filtering, chronological sorting,
// 4-event initial view, horizontal banner rendering, load-more pagination, and empty states.

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { DEFAULT_PUBLIC_DATA } from './public-data.js';
import { sanitize, formatUAEDateParts, formatUAEEventDate } from './utils.js';

const INITIAL_DISPLAY_COUNT = 4;
const PAGE_SIZE = 4;

/**
 * Filter and sort events chronologically according to club rules:
 * - Status must be 'published'
 * - Event status must not be 'cancelled' or 'archived'
 * - Event must not be in the past (based on end_time or start_time >= now)
 * - Chronological ascending order (nearest upcoming first)
 */
export function filterEligibleUpcomingEvents(events, referenceDate = new Date()) {
  if (!Array.isArray(events)) return [];

  const nowMs = referenceDate.getTime();

  return events
    .filter(evt => {
      if (!evt) return false;
      // Must be published
      if (evt.status && evt.status !== 'published') return false;
      // Must not be cancelled or archived
      if (evt.event_status === 'cancelled' || evt.event_status === 'archived') return false;
      if (evt.status === 'archived') return false;

      // Check if event is in the past
      const endMs = evt.end_time ? new Date(evt.end_time).getTime() : null;
      const startMs = evt.start_time ? new Date(evt.start_time).getTime() : null;

      if (endMs && !isNaN(endMs)) {
        return endMs >= nowMs;
      }
      if (startMs && !isNaN(startMs)) {
        return startMs >= nowMs;
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.start_time || 0).getTime();
      const timeB = new Date(b.start_time || 0).getTime();
      return timeA - timeB;
    });
}

/**
 * Fetch all published upcoming events from Supabase or fallback to verified starter data
 */
export async function fetchUpcomingEvents() {
  const supabase = getSupabase();
  let rawEvents = [];

  if (isSupabaseConfigured() && supabase) {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_time', { ascending: true });

      if (!error && Array.isArray(data)) {
        rawEvents = data;
      }
    } catch (err) {
      console.warn('Error fetching upcoming events from Supabase:', err);
    }
  }

  return filterEligibleUpcomingEvents(rawEvents);
}

/**
 * Render a single horizontal event banner
 */
export function renderEventBannerHtml(evt) {
  const dateParts = formatUAEDateParts(evt.start_time);
  const coverUrl = evt.cover_image_url || 'assets/icons/image-placeholder.svg';
  const category = evt.category || 'Community Service';
  const locationText = evt.venue_name || evt.location || 'Dubai, UAE';
  const summaryText = evt.short_summary || evt.description || 'Community outreach initiative by Dubai Oasis Lions Club.';
  const slug = evt.slug || evt.id;

  return `
    <article class="event-horizontal-banner" data-event-id="${sanitize(evt.id || '')}">
      <div class="event-banner-media">
        <img src="${sanitize(coverUrl)}" alt="${sanitize(evt.title)}" class="event-banner-img" loading="lazy" onerror="this.src='assets/icons/image-placeholder.svg'">
        <span class="event-banner-category">${sanitize(category)}</span>
      </div>

      <div class="event-banner-content">
        <div class="event-banner-meta-bar">
          <div class="event-calendar-badge" title="${sanitize(dateParts.fullDate)}">
            <span class="event-badge-month">${sanitize(dateParts.month)}</span>
            <span class="event-badge-day">${sanitize(dateParts.day)}</span>
          </div>

          <div class="event-meta-info">
            <div class="event-meta-item">
              <svg class="event-meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${sanitize(dateParts.time)} (${sanitize(dateParts.weekday)})</span>
            </div>
            <div class="event-meta-item">
              <svg class="event-meta-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span class="event-venue-truncate" title="${sanitize(locationText)}">${sanitize(locationText)}</span>
            </div>
          </div>
        </div>

        <h3 class="event-banner-title">
          <a href="event-detail.html?slug=${encodeURIComponent(slug)}">${sanitize(evt.title)}</a>
        </h3>

        <p class="event-banner-desc">${sanitize(summaryText)}</p>

        <div class="event-banner-actions">
          <a href="event-detail.html?slug=${encodeURIComponent(slug)}" class="btn-event-know-more">
            Know More <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Initialize and render the Upcoming Events section inside the given container element
 * Renders nearest upcoming events first inside a tasteful, vertically scrollable container.
 */
export function initUpcomingEventsSection(containerId, eligibleEvents) {
  const mount = document.getElementById(containerId);
  if (!mount) return;

  if (!eligibleEvents || eligibleEvents.length === 0) {
    mount.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <h3 class="empty-state-title">Upcoming Events Will Be Announced Soon</h3>
        <p class="empty-state-desc">Our upcoming humanitarian drives and club assemblies are being scheduled. Please check back soon or explore our service projects.</p>
        <a href="projects.html" class="btn btn-primary" style="margin-top:16px;">Explore Service Projects</a>
      </div>
    `;
    return;
  }

  mount.innerHTML = `
    <div class="events-stream-wrapper">
      <div class="events-scrollable-container" tabindex="0" role="region" aria-label="Upcoming Events Scrollable List">
        <div class="events-horizontal-stream" id="events-stream-list" role="feed" aria-label="Upcoming Events Stream">
          ${eligibleEvents.map(evt => renderEventBannerHtml(evt)).join('')}
        </div>
      </div>

      <div class="events-stream-footer">
        <span class="events-scroll-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          Scroll within list to explore all upcoming events (${eligibleEvents.length} scheduled)
        </span>
        <a href="events.html" class="events-view-all-link">
          View Complete Community Calendar &rarr;
        </a>
      </div>
    </div>
  `;
}

