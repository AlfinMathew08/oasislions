// Configuration file for Dubai Oasis Lions Club
// Supabase credentials and application defaults

export const APP_CONFIG = {
  clubName: 'Dubai Oasis Lions Club',
  theme: 'Together We Can',
  lionsYear: '2026–2027',
  storageBucket: 'club-media',
  // Configure with your Supabase Project settings
  // The anon key is safe for client-side usage protected by Supabase RLS.
  supabaseUrl: window.ENV?.SUPABASE_URL || 'https://your-project.supabase.co',
  supabaseAnonKey: window.ENV?.SUPABASE_ANON_KEY || 'your-anon-key'
};

// Check if credentials are properly set
export const isSupabaseConfigured = () => {
  return APP_CONFIG.supabaseUrl && 
         !APP_CONFIG.supabaseUrl.includes('your-project') &&
         APP_CONFIG.supabaseAnonKey &&
         !APP_CONFIG.supabaseAnonKey.includes('your-anon-key');
};
