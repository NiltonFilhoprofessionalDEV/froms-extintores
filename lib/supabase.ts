import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

export const supabase = createClient(
  assertEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
  assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey),
  { auth: { persistSession: false } }
);

export const supabaseAdmin =
  supabaseServiceRole != null
    ? createClient(assertEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl), supabaseServiceRole, {
        auth: { persistSession: false }
      })
    : null;
