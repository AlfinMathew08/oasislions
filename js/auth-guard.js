// Dubai Oasis Lions Club — Private Members Portal Guard & Session Controller
// Ensures protected internal pages verify active member session state and
// enables authenticated logout interactions and header scrolling across all internal subpages.

(function () {
  try {
    const isAuthed = sessionStorage.getItem('dolc_member_active') === 'true';
    if (!isAuthed) {
      window.location.replace('login.html');
    }
  } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', () => {
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

  // Header scroll appearance
  const header = document.querySelector('.site-header');
  if (header) {
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

  // Mobile drawer interaction for subpages
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');

  if (toggleBtn && drawer && overlay) {
    if (!toggleBtn.dataset.drawerBound) {
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
});
