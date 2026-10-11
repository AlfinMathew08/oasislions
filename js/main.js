// Dubai Oasis Lions Club — Main Public Portal Controller
// Preserves the approved Apple TV-Style News Editorial Carousel while powering the
// new Compact Leadership Showcase + Interactive Leader Profile Modal.

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { DEFAULT_PUBLIC_DATA } from './public-data.js';
import { fetchVerifiedLeadership, renderCompactLeadershipGrid } from './leadership.js';
import { formatDate, formatUAEEventDate, showToast, sanitize } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  initMobileDrawer();
  await loadHomepageContent();
  initContactForms();
  initLightbox();
});

function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');

  if (toggleBtn && drawer && overlay) {
    const openMenu = () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    toggleBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
  }
}

async function loadHomepageContent() {
  const supabase = getSupabase();
  let news = DEFAULT_PUBLIC_DATA.news;
  let events = DEFAULT_PUBLIC_DATA.events;
  let projects = DEFAULT_PUBLIC_DATA.projects;
  let members = DEFAULT_PUBLIC_DATA.members;
  let impact = DEFAULT_PUBLIC_DATA.impact;
  let gallery = DEFAULT_PUBLIC_DATA.gallery;

  // 1. Load Unified Verified Leadership Data & Render Compact Showcase + Profile Modal
  const leaders = await fetchVerifiedLeadership();
  renderCompactLeadershipGrid('leadership-compact-mount', leaders);

  // 2. Load Remaining Sections from Supabase (if configured)
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbNews } = await supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5);
      if (dbNews && dbNews.length > 0) news = dbNews;

      const { data: dbEvents } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_time', { ascending: true })
        .limit(4);
      if (dbEvents && dbEvents.length > 0) events = dbEvents;

      const { data: dbProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .limit(3);
      if (dbProjects && dbProjects.length > 0) projects = dbProjects;

      const { data: dbImpact } = await supabase
        .from('impact_metrics')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');
      if (dbImpact && dbImpact.length > 0) impact = dbImpact;
    } catch (err) {
      console.warn('Using curated editorial fallback data:', err);
    }
  }

  renderNewsCarousel(news);
  renderEventsShowcase(events);
  renderProjectsShowcase(projects);
  renderImpactSection(impact);
  renderMembersPreview(members);
  renderMomentsGallery(gallery);
}

/* ==========================================================================
   APPLE TV-STYLE CENTER-STAGE PEEKING CAROUSEL ENGINE (Preserved for News)
   ========================================================================== */
function createAppleCarousel(mountId, slidesHtml, slideCount) {
  const mount = document.getElementById(mountId);
  if (!mount || slideCount === 0) return;

  mount.innerHTML = `
    <div class="apple-carousel-viewport" tabindex="0" role="region" aria-label="Featured news stories carousel">
      <div class="apple-carousel-track">
        ${slidesHtml}
      </div>
    </div>
    <div class="apple-carousel-controls">
      <button type="button" class="apple-arrow-btn prev" aria-label="Previous story">&larr;</button>
      <div class="apple-dots" role="tablist">
        ${Array.from({ length: slideCount }, (_, i) => `
          <button type="button" class="apple-dot ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="Go to story ${i + 1}"></button>
        `).join('')}
      </div>
      <button type="button" class="apple-arrow-btn next" aria-label="Next story">&rarr;</button>
    </div>
  `;

  const viewport = mount.querySelector('.apple-carousel-viewport');
  const track = mount.querySelector('.apple-carousel-track');
  const slides = Array.from(track.querySelectorAll('.apple-carousel-slide'));
  const dots = Array.from(mount.querySelectorAll('.apple-dot'));
  const prevBtn = mount.querySelector('.apple-arrow-btn.prev');
  const nextBtn = mount.querySelector('.apple-arrow-btn.next');

  let activeIndex = 0;

  function updateCarousel() {
    if (!slides.length) return;
    const viewportWidth = viewport.clientWidth;
    const slideEl = slides[activeIndex];
    const slideWidth = slideEl.offsetWidth;
    const slideLeft = slideEl.offsetLeft;

    const targetOffset = (viewportWidth - slideWidth) / 2 - slideLeft;
    track.style.transform = `translate3d(${targetOffset}px, 0, 0)`;

    slides.forEach((s, idx) => {
      s.classList.toggle('is-active', idx === activeIndex);
      s.setAttribute('aria-hidden', idx !== activeIndex ? 'true' : 'false');
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('is-active', idx === activeIndex);
    });
  }

  function goTo(index) {
    activeIndex = (index + slides.length) % slides.length;
    updateCarousel();
  }

  prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
  nextBtn.addEventListener('click', () => goTo(activeIndex + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
    });
  });

  slides.forEach((slide, idx) => {
    slide.addEventListener('click', (e) => {
      if (idx !== activeIndex) {
        e.preventDefault();
        goTo(idx);
      }
    });
  });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
  });

  let startX = 0;
  viewport.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) goTo(activeIndex + 1);
      else goTo(activeIndex - 1);
    }
  }, { passive: true });

  window.addEventListener('resize', updateCarousel);
  requestAnimationFrame(() => updateCarousel());
}

/* ==========================================================================
   SECTION 3 — THE LATEST (NEWS & ANNOUNCEMENTS CAROUSEL — PRESERVED)
   ========================================================================== */
function renderNewsCarousel(news) {
  const fallbackImages = [
    'assets/images/hero-service.jpg',
    'assets/images/project-vision.jpg',
    'assets/images/project-youth.jpg'
  ];

  const slidesHtml = news.map((item, idx) => {
    const imgUrl = item.cover_image_url || fallbackImages[idx % fallbackImages.length];
    return `
      <article class="apple-carousel-slide ${idx === 0 ? 'is-active' : ''}">
        <img src="${sanitize(imgUrl)}" alt="${sanitize(item.title)}" class="apple-slide-img" loading="lazy">
        <div class="apple-slide-scrim"></div>
        <div class="apple-slide-caption">
          <div class="apple-slide-text-col">
            <span class="apple-slide-eyebrow">${sanitize(item.category)} &bull; ${formatDate(item.published_at)}</span>
            <h3 class="apple-slide-title">${sanitize(item.title)}</h3>
            <p class="apple-slide-sub">${sanitize(item.summary)}</p>
          </div>
          <a href="news-detail.html?slug=${encodeURIComponent(item.slug)}" class="apple-slide-cta">Read Story &rarr;</a>
        </div>
      </article>
    `;
  }).join('');

  createAppleCarousel('news-carousel-mount', slidesHtml, news.length);
}

/* ==========================================================================
   SECTION 4 — UPCOMING EVENTS
   ========================================================================== */
function renderEventsShowcase(events) {
  const mount = document.getElementById('events-mount');
  if (!mount || !events.length) return;

  const featured = events[0];
  const secondary = events.slice(1, 3);

  mount.innerHTML = `
    <div class="events-showcase-grid">
      <article class="event-featured-panel">
        <img src="${sanitize(featured.cover_image_url || 'assets/images/project-vision.jpg')}" alt="${sanitize(featured.title)}" loading="lazy">
        <div class="event-featured-scrim"></div>
        <div class="event-featured-content">
          <span class="apple-slide-eyebrow">${formatUAEEventDate(featured.start_time)}</span>
          <h3 style="font-size:clamp(1.75rem, 3vw, 2.4rem); font-weight:800; line-height:1.15; margin-bottom:12px; color:#FFFFFF;">
            ${sanitize(featured.title)}
          </h3>
          <p style="color:rgba(255,255,255,0.85); font-size:1rem; line-height:1.6; margin-bottom:20px; max-width:540px;">
            ${sanitize(featured.description)}
          </p>
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <span style="font-size:0.88rem; color:var(--color-accent); font-weight:600;">📍 ${sanitize(featured.location)}</span>
            <a href="events.html" class="apple-slide-cta">Event Details &rarr;</a>
          </div>
        </div>
      </article>

      <div class="events-side-list">
        ${secondary.map(evt => `
          <article class="event-editorial-item">
            <div class="event-date-stamp">${formatUAEEventDate(evt.start_time)}</div>
            <h4 style="font-size:1.35rem; font-weight:700; color:var(--color-text); line-height:1.3;">${sanitize(evt.title)}</h4>
            <p style="font-size:0.94rem; color:var(--color-text-secondary); line-height:1.55;">${sanitize(evt.description)}</p>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px; padding-top:14px; border-top:1px solid var(--color-border-subtle);">
              <span style="font-size:0.84rem; color:var(--color-text-muted); font-weight:500;">📍 ${sanitize(evt.location)}</span>
              <a href="contact.html?subject=${encodeURIComponent('Interest in Event: ' + evt.title)}" class="btn-text-link" style="font-size:0.88rem;">Register Interest &rarr;</a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   SECTION 6 — FEATURED SERVICE PROJECTS
   ========================================================================== */
function renderProjectsShowcase(projects) {
  const mount = document.getElementById('projects-mount');
  if (!mount || !projects.length) return;

  const lead = projects[0];
  const others = projects.slice(1, 3);

  mount.innerHTML = `
    <div class="projects-editorial-layout">
      <article class="project-lead-feature">
        <div class="project-lead-media">
          <img src="${sanitize(lead.cover_image_url || 'assets/images/project-vision.jpg')}" alt="${sanitize(lead.title)}" loading="lazy">
        </div>
        <div class="project-lead-copy">
          <span class="eyebrow">${sanitize(lead.category)}</span>
          <h3 style="font-size:clamp(1.85rem, 3vw, 2.5rem); font-weight:800; line-height:1.15; letter-spacing:-0.03em; color:var(--color-text); margin-bottom:16px;">
            ${sanitize(lead.title)}
          </h3>
          <p style="font-size:1.05rem; color:var(--color-text-secondary); line-height:1.65; margin-bottom:28px;">
            ${sanitize(lead.summary)}
          </p>
          <a href="project-detail.html?slug=${encodeURIComponent(lead.slug)}" class="btn btn-primary" style="align-self:flex-start;">Explore Project &rarr;</a>
        </div>
      </article>

      <div class="projects-secondary-row">
        ${others.map(proj => `
          <article class="project-secondary-panel">
            <div class="project-secondary-media">
              <img src="${sanitize(proj.cover_image_url || 'assets/images/project-food.jpg')}" alt="${sanitize(proj.title)}" loading="lazy">
            </div>
            <div class="project-secondary-body">
              <span class="eyebrow" style="margin-bottom:8px;">${sanitize(proj.category)}</span>
              <h4 style="font-size:1.4rem; font-weight:700; color:var(--color-text); margin-bottom:12px; line-height:1.25;">${sanitize(proj.title)}</h4>
              <p style="font-size:0.95rem; color:var(--color-text-secondary); line-height:1.6; margin-bottom:24px; flex:1;">${sanitize(proj.summary)}</p>
              <a href="project-detail.html?slug=${encodeURIComponent(proj.slug)}" class="btn-text-link">Explore Project &rarr;</a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   SECTION 7 — OUR IMPACT
   ========================================================================== */
function renderImpactSection(impact) {
  const mount = document.getElementById('impact-mount');
  if (!mount) return;

  if (!impact || impact.length === 0) {
    mount.innerHTML = `
      <div style="padding-top:40px; border-top:1px solid rgba(255,255,255,0.14); display:grid; grid-template-columns:repeat(3, 1fr); gap:36px;">
        <div>
          <h4 style="font-size:1.25rem; font-weight:700; color:var(--color-accent); margin-bottom:10px;">Sight & Healthcare</h4>
          <p style="font-size:0.95rem; color:rgba(255,255,255,0.75); line-height:1.6;">Preventable blindness screening and accessible community health checkups across Dubai.</p>
        </div>
        <div>
          <h4 style="font-size:1.25rem; font-weight:700; color:var(--color-accent); margin-bottom:10px;">Nourishment & Care</h4>
          <p style="font-size:0.95rem; color:rgba(255,255,255,0.75); line-height:1.6;">Dignified food security initiatives organized in partnership with licensed humanitarian channels.</p>
        </div>
        <div>
          <h4 style="font-size:1.25rem; font-weight:700; color:var(--color-accent); margin-bottom:10px;">Youth & Environment</h4>
          <p style="font-size:0.95rem; color:rgba(255,255,255,0.75); line-height:1.6;">Cultivating ethical next-generation leaders and preserving native desert ecosystems.</p>
        </div>
      </div>
    `;
    return;
  }

  mount.innerHTML = `
    <div class="impact-metrics-row">
      ${impact.map(imp => `
        <div>
          <div class="impact-stat-num">${sanitize(imp.metric_value || imp.value)}</div>
          <div class="impact-stat-title">${sanitize(imp.metric_label || imp.label)}</div>
          <div class="impact-stat-note">${sanitize(imp.verification_note || imp.note || '')}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   SECTION 8 — MEET OUR MEMBERS
   ========================================================================== */
function renderMembersPreview(members) {
  const mount = document.getElementById('members-mount');
  if (!mount || !members.length) return;

  mount.innerHTML = members.map(m => `
    <article class="member-editorial-card">
      <div class="member-photo-box">
        <img src="${sanitize(m.avatar || 'assets/images/leadership-1.jpg')}" alt="${sanitize(m.name)}" loading="lazy">
      </div>
      <div class="member-card-copy">
        <span class="eyebrow" style="margin-bottom:6px;">${sanitize(m.committee || 'Club Fellowship')}</span>
        <h4 style="font-size:1.35rem; font-weight:700; color:var(--color-text); margin-bottom:4px;">${sanitize(m.name)}</h4>
        <div style="font-size:0.88rem; font-weight:600; color:var(--color-primary); margin-bottom:12px;">${sanitize(m.role)}</div>
        <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.55; margin-bottom:16px;">${sanitize(m.bio)}</p>
        <a href="member-profile.html?id=${encodeURIComponent(m.id)}" class="btn-text-link" style="font-size:0.88rem;">View Profile &rarr;</a>
      </div>
    </article>
  `).join('');
}

/* ==========================================================================
   SECTION 9 — MOMENTS OF SERVICE
   ========================================================================== */
function renderMomentsGallery(gallery) {
  const mount = document.getElementById('gallery-mount');
  if (!mount || !gallery.length) return;

  const first = gallery[0];
  const rest = gallery.slice(1, 3);

  mount.innerHTML = `
    <div class="moments-editorial-mosaic">
      <div class="moment-card large" data-lightbox="${sanitize(first.url)}">
        <img src="${sanitize(first.url)}" alt="${sanitize(first.title)}" loading="lazy">
        <div class="moment-caption-bar">
          <h4 style="font-size:1.35rem; font-weight:700; margin-bottom:4px;">${sanitize(first.title)}</h4>
          <p style="font-size:0.9rem; color:rgba(255,255,255,0.8);">${sanitize(first.caption)}</p>
        </div>
      </div>
      <div class="moments-right-col">
        ${rest.map(item => `
          <div class="moment-card small" data-lightbox="${sanitize(item.url)}">
            <img src="${sanitize(item.url)}" alt="${sanitize(item.title)}" loading="lazy">
            <div class="moment-caption-bar">
              <h4 style="font-size:1.15rem; font-weight:700; margin-bottom:2px;">${sanitize(item.title)}</h4>
              <p style="font-size:0.84rem; color:rgba(255,255,255,0.8);">${sanitize(item.caption)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function initLightbox() {
  const modal = document.createElement('div');
  modal.className = 'lightbox-modal';
  modal.innerHTML = `<img src="" alt="Enlarged club service moment">`;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('img');

  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-lightbox]');
    if (card) {
      modalImg.src = card.getAttribute('data-lightbox');
      modal.classList.add('open');
    } else if (e.target === modal || e.target === modalImg) {
      modal.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('open');
  });
}

function initContactForms() {
  const forms = document.querySelectorAll('.supabase-contact-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      const formData = new FormData(form);
      const payload = {
        enquiry_type: formData.get('enquiry_type') || 'General Contact',
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone') || null,
        message: formData.get('message')
      };

      const supabase = getSupabase();
      if (isSupabaseConfigured() && supabase) {
        try {
          const { error } = await supabase.from('contact_enquiries').insert([payload]);
          if (error) throw error;
          showToast('Thank you! Your inquiry was safely received.', 'success');
          form.reset();
        } catch (err) {
          console.error(err);
          showToast('Unable to submit enquiry. Please try again.', 'error');
        }
      } else {
        setTimeout(() => {
          showToast('Enquiry recorded in local preview mode.', 'info');
          form.reset();
        }, 400);
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Official Enquiry';
      }
    });
  });
}
