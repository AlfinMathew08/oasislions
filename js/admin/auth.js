// Admin Authentication and Authorization Helper
import { getSupabase, isSupabaseConfigured } from '../supabase.js';
import { showToast } from '../utils.js';

export async function checkAdminSession() {
  initAdminMobileDrawer();

  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    // When Supabase is not configured, grant local preview access with disclaimer
    console.warn('Supabase not configured: Running admin panel in Local Development Mode.');
    return { user: { email: 'admin@preview.local' }, role: 'admin', isLocalDev: true };
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('admin.html')) {
      window.location.href = window.location.pathname.includes('/admin/') ? 'login.html' : 'admin.html';
    }
    return null;
  }

  // Fetch verified role from user_roles
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  if (roleError || !roleData || !['admin', 'editor'].includes(roleData.role)) {
    await supabase.auth.signOut();
    alert('Access Denied: You do not have authorized administrator or editor permissions.');
    window.location.href = window.location.pathname.includes('/admin/') ? 'login.html' : 'admin.html';
    return null;
  }

  return { user: session.user, role: roleData.role, isLocalDev: false };
}

function initAdminMobileDrawer() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('admin-mobile-backdrop')) return;

  const sidebar = document.querySelector('.admin-sidebar');
  if (!sidebar) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'admin-mobile-backdrop';
  backdrop.className = 'admin-sidebar-backdrop';
  document.body.appendChild(backdrop);

  let toggleBtn = document.getElementById('admin-mobile-toggle');
  if (!toggleBtn) {
    const topbar = document.querySelector('.admin-topbar');
    if (topbar) {
      toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.id = 'admin-mobile-toggle';
      toggleBtn.className = 'admin-mobile-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle admin navigation menu');
      toggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
      topbar.prepend(toggleBtn);
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('is-open');
      backdrop.classList.toggle('is-open');
    });
  }

  backdrop.addEventListener('click', () => {
    sidebar.classList.remove('is-open');
    backdrop.classList.remove('is-open');
  });

  sidebar.querySelectorAll('.admin-nav-item').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 960) {
        sidebar.classList.remove('is-open');
        backdrop.classList.remove('is-open');
      }
    });
  });
}

export async function loginAdmin(email, password) {
  const targetDashboard = window.location.pathname.endsWith('admin.html') ? 'admin/index.html' : 'index.html';
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    // Local demo login
    showToast('Logged in as Local Administrator (Local Development Mode)', 'info');
    setTimeout(() => { window.location.href = targetDashboard; }, 800);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast(error.message, 'error');
    throw error;
  }

  // Verify role
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .single();

  if (roleError || !roleData || !['admin', 'editor'].includes(roleData.role)) {
    await supabase.auth.signOut();
    throw new Error('Unauthorized account role');
  }

  showToast('Welcome, Administrator!', 'success');
  window.location.href = targetDashboard;
}

export async function logoutAdmin() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  const targetLogin = window.location.pathname.includes('/admin/') ? 'login.html' : 'admin.html';
  window.location.href = targetLogin;
}
