// supabaseClient.js — crea el cliente de Supabase si hay credenciales.
// Si faltan, exporta `supabase = null` y la app usa localStorage como respaldo,
// para poder probarla antes de conectar la base de datos.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
