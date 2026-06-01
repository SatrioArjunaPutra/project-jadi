import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase credentials are missing. Running with mock client to prevent app crash.");
  client = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: new Error("Supabase URL or Key is missing") })
    })
  };
}

export const supabase = client;

