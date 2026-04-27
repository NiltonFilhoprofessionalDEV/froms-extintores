import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Valida chave admin e presença do client service role.
 * Retorna null se OK; caso contrário, a resposta de erro a ser devolvida.
 */
export function assertAdminAccess(request: Request): NextResponse | null {
  const adminImportKey = process.env.ADMIN_IMPORT_KEY;
  const sentKey = request.headers.get("x-admin-key");

  if (!adminImportKey) {
    return NextResponse.json(
      { error: "Defina ADMIN_IMPORT_KEY no ambiente." },
      { status: 500 }
    );
  }

  if (!sentKey || sentKey !== adminImportKey) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Defina SUPABASE_SERVICE_ROLE_KEY no ambiente." },
      { status: 500 }
    );
  }

  return null;
}

export function getSupabaseAdmin() {
  return supabaseAdmin!;
}
