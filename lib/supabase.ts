import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function assertEnv(name: string, value?: string): string {
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

let supabaseClient: SupabaseClient | undefined;
let supabaseAdminClient: SupabaseClient | undefined;

/**
 * Cliente público (anon). Criação lazy evita erro no `next build` (ex.: Vercel)
 * quando rotas são analisadas sem variáveis de ambiente ainda injetadas.
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(
      assertEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
      assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      { auth: { persistSession: false } }
    );
  }
  return supabaseClient;
}

/** Service role, ou null se SUPABASE_SERVICE_ROLE_KEY não estiver definida. */
export function getSupabaseAdminOrNull(): SupabaseClient | null {
  const role = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!role) return null;
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      assertEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
      role,
      { auth: { persistSession: false } }
    );
  }
  return supabaseAdminClient;
}
