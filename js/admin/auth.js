// Admin Authentication and Authorization Helper
import { getSupabase, isSupabaseConfigured } from '../supabase.js';
import { showToast } from '../utils.js';

export async function checkAdminSession() {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    // When Supabase is not configured, grant local preview access with disclaimer
    console.warn('Supabase not configured: Running admin panel in Local Development Mode.');
    return { user: { email: 'admin@preview.local' }, role: 'admin', isLocalDev: true };
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
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
    window.location.href = 'login.html';
    return null;
  }

  return { user: session.user, role: roleData.role, isLocalDev: false };
}

export async function loginAdmin(email, password) {
  const supabase = getSupabase();
  if (!isSupabaseConfigured() || !supabase) {
    // Local demo login
    showToast('Logged in as Local Administrator (Local Development Mode)', 'info');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
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
  window.location.href = 'index.html';
}

export async function logoutAdmin() {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  window.location.href = 'login.html';
}
