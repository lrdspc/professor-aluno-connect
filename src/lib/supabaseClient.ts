import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase'; // Assumindo que geraremos tipos do Supabase depois

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not defined. Please check your .env file.");
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
