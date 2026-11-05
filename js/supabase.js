// Centralized Supabase Client Wrapper & Storage Helpers
// Dubai Oasis Lions Club — Lions Year 2026–2027

import { APP_CONFIG, isSupabaseConfigured } from './config.js';

let supabaseClient = null;

/**
 * Returns the singleton Supabase client instance.
 * Supports browser environment (window.supabase) and Node test runners.
 */
export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (!isSupabaseConfigured()) {
    console.warn('Supabase credentials are not configured or invalid.');
    return null;
  }

  // 1. Browser runtime via CDN script tag (window.supabase)
  if (typeof window !== 'undefined' && window.supabase?.createClient) {
    try {
      supabaseClient = window.supabase.createClient(
        APP_CONFIG.supabaseUrl,
        APP_CONFIG.supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
      return supabaseClient;
    } catch (err) {
      console.error('Failed to initialize Supabase browser client:', err);
      return null;
    }
  }

  // 2. Global instance fallback (e.g. injected in test runners or workers)
  if (typeof globalThis !== 'undefined' && globalThis.supabaseClient) {
    supabaseClient = globalThis.supabaseClient;
    return supabaseClient;
  }

  return null;
}

/**
 * Checks connection health and schema accessibility against the Supabase project.
 */
export async function checkSupabaseHealth() {
  const sb = getSupabase();
  if (!sb) {
    return {
      ok: false,
      configured: false,
      message: 'Supabase client could not be initialized. Verify SDK and credentials.'
    };
  }

  try {
    // Probe members table
    const { data, error } = await sb.from('members').select('id').limit(1);
    if (error) {
      return {
        ok: false,
        configured: true,
        code: error.code,
        message: error.message,
        hint: error.hint || error.details || 'Schema may not be initialized yet in Supabase.'
      };
    }

    return {
      ok: true,
      configured: true,
      message: 'Connected to Supabase successfully.',
      sampleRows: data ? data.length : 0
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      message: err.message || 'Network exception while connecting to Supabase.'
    };
  }
}

/**
 * Uploads an image asset to the official 'club-media' storage bucket.
 * Generates an organized storage path, handles errors, and returns the public URL.
 *
 * @param {File|Blob} file - The file to upload
 * @param {string} folder - Target folder ('members', 'family', 'leadership', 'news', 'events', 'projects', 'gallery')
 * @returns {Promise<{ ok: boolean, url?: string, path?: string, error?: string }>}
 */
export async function uploadClubMedia(file, folder = 'general') {
  if (!file) {
    return { ok: false, error: 'No file provided for upload.' };
  }

  const sb = getSupabase();
  if (!sb || !isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase client is not configured for cloud storage.' };
  }

  try {
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
    const cleanBase = file.name
      ? file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40)
      : 'asset';
    const filePath = `${folder}/${Date.now()}-${cleanBase}.${ext}`;

    const { error: uploadError } = await sb.storage
      .from(APP_CONFIG.storageBucket || 'club-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return { ok: false, error: uploadError.message };
    }

    const { data: pubData } = sb.storage
      .from(APP_CONFIG.storageBucket || 'club-media')
      .getPublicUrl(filePath);

    if (!pubData || !pubData.publicUrl) {
      return { ok: false, error: 'Could not obtain public URL for uploaded asset.' };
    }

    return {
      ok: true,
      url: pubData.publicUrl,
      path: filePath
    };
  } catch (err) {
    console.error('Storage upload exception:', err);
    return { ok: false, error: err.message || 'Upload exception' };
  }
}

export { isSupabaseConfigured };
