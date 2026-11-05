// Configuration file for Dubai Oasis Lions Club
// Supabase credentials and application defaults

export const APP_CONFIG = {
  clubName: 'Dubai Oasis Lions Club',
  theme: 'We Serve',
  motto: 'We Serve',
  lionsYear: '2026–2027',
  storageBucket: 'club-media',
  // Live Supabase Project Settings
  // The publishable / anon key is safe for client-side usage protected by Supabase RLS.
  supabaseUrl: (typeof window !== 'undefined' && window.ENV?.SUPABASE_URL) ||
               (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
               'https://ddmbxqabgfqviedayifo.supabase.co',
  supabaseAnonKey: (typeof window !== 'undefined' && (window.ENV?.SUPABASE_PUBLISHABLE_KEY || window.ENV?.SUPABASE_ANON_KEY)) ||
                   (typeof process !== 'undefined' && (process.env?.SUPABASE_PUBLISHABLE_KEY || process.env?.SUPABASE_ANON_KEY)) ||
                   'sb_publishable_RXF5jbVR8qLuCF2aYmq-Ag_IWGWDu9-'
};

// Check if credentials are properly set
export const isSupabaseConfigured = () => {
  return Boolean(
    APP_CONFIG.supabaseUrl &&
    !APP_CONFIG.supabaseUrl.includes('your-project') &&
    APP_CONFIG.supabaseAnonKey &&
    !APP_CONFIG.supabaseAnonKey.includes('your-anon-key')
  );
};

