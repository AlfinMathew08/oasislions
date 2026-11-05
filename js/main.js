// Dubai Oasis Lions Club — Main Public Portal Controller
// Safely initializes only the sections present in the current DOM while preserving
// shared renderers, Supabase integration, and interactive components across the site.

import { getSupabase, isSupabaseConfigured } from './supabase.js';
import { DEFAULT_PUBLIC_DATA } from './public-data.js';
import { fetchVerifiedLeadership, renderCompactLeadershipGrid } from './leadership.js';
import { fetchUpcomingEvents, initUpcomingEventsSection } from './events.js';
import { initMembersDirectory } from './members.js';
import { initContactSection } from './contact.js';
import { formatDate, formatUAEEventDate, showToast, sanitize } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  initMobileDrawer();
  initPortalSession();
  initHeaderScroll();
  initScrollReveal();
  await loadHomepageContent();
  initContactForms();
  initLightbox();

  // Return flow hash scroll restoration
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }
});

function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');

  if (toggleBtn && drawer && overlay) {
    if (toggleBtn.dataset.drawerBound) return;
    toggleBtn.dataset.drawerBound = 'true';

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

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }
}

async function applyHomepageCopyOverrides(supabase) {
  let copy = null;
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_copy')
        .maybeSingle();
      if (data && data.value) copy = data.value;
    } catch (_) {}
  }
  if (!copy) {
    try {
      const localRaw = localStorage.getItem('lions_homepage_copy_v1');
      if (localRaw) copy = JSON.parse(localRaw);
    } catch (_) {}
  }
  if (!copy) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el && val && String(val).trim()) el.textContent = String(val).trim();
  };
  setTxt('hero-headline-text', copy.hero_headline);
  setTxt('hero-subline-text', copy.hero_subline);
  setTxt('who-we-are-title', copy.who_we_are_title);
  setTxt('who-we-are-p1', copy.who_we_are_p1);
  setTxt('who-we-are-p2', copy.who_we_are_p2);
}

async function loadHomepageContent() {
  const supabase = getSupabase();
  await applyHomepageCopyOverrides(supabase);

  // 1. Leadership Section (Safely isolated to ensure no downstream section failure)
  if (document.getElementById('leadership-compact-mount')) {
    try {
      const leaders = await fetchVerifiedLeadership();
      renderCompactLeadershipGrid('leadership-compact-mount', leaders);
    } catch (err) {
      console.warn('Error rendering leadership section:', err);
    }
  }

  // 2. Latest News Editorial Carousel (Only fetch & render if news mount exists on page)
  if (document.getElementById('news-carousel-mount')) {
    let news = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbNews } = await supabase
          .from('news_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5);
        if (dbNews && dbNews.length > 0) news = dbNews;
      } catch (err) {
        console.warn('Error fetching news:', err);
      }
    }
    renderNewsCarousel(news);
  }

  // 3. Upcoming Events Section (Four Nearest Events First, Horizontal Banners, Load More)
  if (document.getElementById('events-mount')) {
    try {
      const eligibleEvents = await fetchUpcomingEvents();
      initUpcomingEventsSection('events-mount', eligibleEvents);
    } catch (err) {
      console.warn('Error loading upcoming events section:', err);
    }
  }

  if (document.getElementById('projects-mount')) {
    let projects = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'published')
          .limit(3);
        if (dbProjects && dbProjects.length > 0) projects = dbProjects;
      } catch (e) { console.warn('Error fetching projects:', e); }
    }
    renderProjectsShowcase(projects);
  }

  if (document.getElementById('impact-mount')) {
    let impact = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbImpact } = await supabase
          .from('impact_metrics')
          .select('*')
          .eq('is_visible', true)
          .order('display_order');
        if (dbImpact && dbImpact.length > 0) impact = dbImpact;
      } catch (e) { console.warn('Error fetching impact:', e); }
    }
    renderImpactSection(impact);
  }

  if (document.getElementById('members-mount')) {
    try {
      await initMembersDirectory('members-mount', 'member-search-input');
    } catch (err) {
      console.warn('Error loading member directory:', err);
    }
  }

  if (document.getElementById('contact-enquiry-form')) {
    try {
      initContactSection('contact-enquiry-form', 'contact-form-feedback');
    } catch (err) {
      console.warn('Error initializing contact section:', err);
    }
  }

  if (document.getElementById('gallery-mount')) {
    let gallery = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: dbGallery } = await supabase
          .from('gallery_images')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        if (dbGallery && dbGallery.length > 0) gallery = dbGallery;
      } catch (e) { console.warn('Error fetching gallery:', e); }
    }
    renderMomentsGallery(gallery);
  }
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
   LATEST NEWS CAROUSEL (PRESERVED)
   ========================================================================== */
function renderNewsCarousel(news) {
  const mount = document.getElementById('news-carousel-mount');
  if (!mount) return;

  if (!news || news.length === 0) {
    mount.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
            <path d="M18 14h-8"></path>
            <path d="M15 18h-5"></path>
            <path d="M10 6h8v4h-8V6Z"></path>
          </svg>
        </div>
        <h3 class="empty-state-title">New Updates Coming Soon</h3>
        <p class="empty-state-desc">Official announcements, press releases, and service stories will be published here as our club year progresses.</p>
      </div>
    `;
    return;
  }

  const slidesHtml = news.map((item, idx) => {
    const imgUrl = item.cover_image_url || 'assets/icons/image-placeholder.svg';
    return `
      <article class="apple-carousel-slide ${idx === 0 ? 'is-active' : ''}">
        <img src="${sanitize(imgUrl)}" alt="${sanitize(item.title)}" class="apple-slide-img" loading="lazy" onerror="this.src='assets/icons/image-placeholder.svg'">
        <div class="apple-slide-scrim"></div>
        <div class="apple-slide-caption">
          <div class="apple-slide-text-col">
            <span class="apple-slide-eyebrow">${sanitize(item.category || 'Announcement')} &bull; ${formatDate(item.published_at)}</span>
            <h3 class="apple-slide-title">${sanitize(item.title)}</h3>
            <p class="apple-slide-sub">${sanitize(item.summary || '')}</p>
          </div>
          <a href="news-detail.html?slug=${encodeURIComponent(item.slug || item.id)}" class="apple-slide-cta">Read Story &rarr;</a>
        </div>
      </article>
    `;
  }).join('');

  createAppleCarousel('news-carousel-mount', slidesHtml, news.length);
}

/* ==========================================================================
   PRESERVED RENDERERS FOR FUTURE-PHASE SECTIONS
   ========================================================================== */
function renderEventsShowcase(events) {
  const mount = document.getElementById('events-mount');
  if (!mount) return;
  if (!events || !events.length) {
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
  const featured = events[0];
  const secondary = events.slice(1, 3);
  mount.innerHTML = `
    <div class="events-showcase-grid">
      <article class="event-featured-panel">
        <img src="${sanitize(featured.cover_image_url || 'assets/icons/image-placeholder.svg')}" alt="${sanitize(featured.title)}" loading="lazy" onerror="this.src='assets/icons/image-placeholder.svg'">
        <div class="event-featured-scrim"></div>
        <div class="event-featured-content">
          <span class="apple-slide-eyebrow">${formatUAEEventDate(featured.start_time)}</span>
          <h3 style="font-size:clamp(1.75rem, 3vw, 2.4rem); font-weight:800; line-height:1.15; margin-bottom:12px; color:#FFFFFF;">${sanitize(featured.title)}</h3>
          <p style="color:rgba(255,255,255,0.85); font-size:1rem; line-height:1.6; margin-bottom:20px; max-width:540px;">${sanitize(featured.description || '')}</p>
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <span style="font-size:0.88rem; color:var(--color-accent); font-weight:600;">Location: ${sanitize(featured.location || 'Dubai, UAE')}</span>
            <a href="events.html" class="apple-slide-cta">Event Details &rarr;</a>
          </div>
        </div>
      </article>
      <div class="events-side-list">
        ${secondary.map(evt => `
          <article class="event-editorial-item">
            <div class="event-date-stamp">${formatUAEEventDate(evt.start_time)}</div>
            <h4 style="font-size:1.35rem; font-weight:700; color:var(--color-text); line-height:1.3;">${sanitize(evt.title)}</h4>
            <p style="font-size:0.94rem; color:var(--color-text-secondary); line-height:1.55;">${sanitize(evt.description || '')}</p>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProjectsShowcase(projects) {
  const mount = document.getElementById('projects-mount');
  if (!mount) return;
  if (!projects || !projects.length) {
    mount.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <h3 class="empty-state-title">Our Latest Service Initiatives Will Appear Here</h3>
        <p class="empty-state-desc">Details on our humanitarian pillars — Sight, Hunger Relief, Environment, Diabetes, and Childhood Cancer — will be featured here.</p>
      </div>
    `;
    return;
  }
  const lead = projects[0];
  const others = projects.slice(1, 3);
  mount.innerHTML = `
    <div class="projects-editorial-layout">
      <article class="project-lead-feature">
        <div class="project-lead-media"><img src="${sanitize(lead.cover_image_url || 'assets/icons/image-placeholder.svg')}" alt="${sanitize(lead.title)}" loading="lazy" onerror="this.src='assets/icons/image-placeholder.svg'"></div>
        <div class="project-lead-copy">
          <span class="eyebrow">${sanitize(lead.category || 'Service Initiative')}</span>
          <h3 style="font-size:clamp(1.85rem, 3vw, 2.5rem); font-weight:800; line-height:1.15; color:var(--color-text); margin-bottom:16px;">${sanitize(lead.title)}</h3>
          <p style="font-size:1.05rem; color:var(--color-text-secondary); line-height:1.65; margin-bottom:28px;">${sanitize(lead.summary || '')}</p>
          <a href="project-detail.html?slug=${encodeURIComponent(lead.slug || lead.id)}" class="btn btn-primary" style="align-self:flex-start;">Explore Project &rarr;</a>
        </div>
      </article>
      <div class="projects-secondary-row">
        ${others.map(proj => `
          <article class="project-secondary-panel">
            <div class="project-secondary-media"><img src="${sanitize(proj.cover_image_url || 'assets/icons/image-placeholder.svg')}" alt="${sanitize(proj.title)}" loading="lazy" onerror="this.src='assets/icons/image-placeholder.svg'"></div>
            <div class="project-secondary-body">
              <span class="eyebrow" style="margin-bottom:8px;">${sanitize(proj.category || 'Service Initiative')}</span>
              <h4 style="font-size:1.4rem; font-weight:700; color:var(--color-text); margin-bottom:12px;">${sanitize(proj.title)}</h4>
              <p style="font-size:0.95rem; color:var(--color-text-secondary); line-height:1.6; margin-bottom:24px; flex:1;">${sanitize(proj.summary || '')}</p>
              <a href="project-detail.html?slug=${encodeURIComponent(proj.slug || proj.id)}" class="btn-text-link">Explore Project &rarr;</a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderImpactSection(impact) {
  const mount = document.getElementById('impact-mount');
  if (!mount) return;
  if (!impact || impact.length === 0) {
    mount.innerHTML = '';
    const section = mount.closest('section');
    if (section) section.style.display = 'none';
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

function renderMembersPreview(members) {
  const mount = document.getElementById('members-mount');
  if (!mount || !members.length) return;
  mount.innerHTML = members.map(m => `
    <article class="member-editorial-card">
      <div class="member-photo-box"><img src="${sanitize(m.avatar || 'assets/icons/avatar-placeholder.svg')}" alt="${sanitize(m.name)}" loading="lazy" onerror="this.src='assets/icons/avatar-placeholder.svg'"></div>
      <div class="member-card-copy">
        <span class="eyebrow" style="margin-bottom:6px;">${sanitize(m.committee || 'Club Fellowship')}</span>
        <h4 style="font-size:1.35rem; font-weight:700; color:var(--color-text); margin-bottom:4px;">${sanitize(m.name)}</h4>
        <div style="font-size:0.88rem; font-weight:600; color:var(--color-primary); margin-bottom:12px;">${sanitize(m.role || 'Member')}</div>
        <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.55; margin-bottom:16px;">${sanitize(m.bio || '')}</p>
        <a href="members.html" class="btn-text-link" style="font-size:0.88rem;">View Profile &rarr;</a>
      </div>
    </article>
  `).join('');
}

function renderMomentsGallery(gallery) {
  const mount = document.getElementById('gallery-mount');
  if (!mount) return;
  if (!gallery || !gallery.length) {
    mount.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <h3 class="empty-state-title">Club Moments Will Appear Here</h3>
        <p class="empty-state-desc">Photographs documenting our service activities and club fellowship will be displayed as events take place.</p>
      </div>
    `;
    return;
  }
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
  if (!document.querySelector('[data-lightbox]')) return;
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
  if (!forms.length) return;
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

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initScrollReveal() {
  if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

function initPortalSession() {
  const logoutHandlers = (e) => {
    e.preventDefault();
    try {
      sessionStorage.removeItem('dolc_member_active');
    } catch (_) {}
    window.location.replace('login.html');
  };

  const desktopLogout = document.getElementById('btn-portal-logout');
  if (desktopLogout) {
    desktopLogout.addEventListener('click', logoutHandlers);
  }

  const drawerLogout = document.getElementById('drawer-portal-logout');
  if (drawerLogout) {
    drawerLogout.addEventListener('click', logoutHandlers);
  }
}
