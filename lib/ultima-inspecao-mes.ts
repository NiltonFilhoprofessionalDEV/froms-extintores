import type { SupabaseClient } from "@supabase/supabase-js";
import type { InspecaoChecklistResumo } from "@/lib/types-inspecao-resumo";

/** Última inspeção do mês com não conforme (via RPC no banco). */
export async function fetchUltimaInspecaoNaoConformeMesExtintor(
  client: SupabaseClient,
  codigo: string
): Promise<InspecaoChecklistResumo | null> {
  const { data, error } = await client
    .rpc("resumo_ultima_inspecao_nc_extintor", { p_codigo: codigo })
    .maybeSingle();
  if (error) {
    console.error("resumo_ultima_inspecao_nc_extintor:", error.message);
    return null;
  }
  return (data as InspecaoChecklistResumo | null) ?? null;
}

export async function fetchUltimaInspecaoNaoConformeMesHidrante(
  client: SupabaseClient,
  codigo: string
): Promise<InspecaoChecklistResumo | null> {
  const { data, error } = await client
    .rpc("resumo_ultima_inspecao_nc_hidrante", { p_codigo: codigo })
    .maybeSingle();
  if (error) {
    console.error("resumo_ultima_inspecao_nc_hidrante:", error.message);
    return null;
  }
  return (data as InspecaoChecklistResumo | null) ?? null;
}
