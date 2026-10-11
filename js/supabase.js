// Supabase Client Wrapper
import { APP_CONFIG, isSupabaseConfigured } from './config.js';

let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (window.supabase) {
    supabaseClient = window.supabase.createClient(
      APP_CONFIG.supabaseUrl,
      APP_CONFIG.supabaseAnonKey
    );
    return supabaseClient;
  }
  
  console.warn('Supabase SDK not loaded or environment not configured.');
  return null;
}

export { isSupabaseConfigured };
