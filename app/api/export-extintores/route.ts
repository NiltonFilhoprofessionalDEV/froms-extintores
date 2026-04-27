import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { assertAdminAccess, getSupabaseAdmin } from "@/lib/admin-api";

function formatDateBr(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("pt-BR");
}

export async function GET(request: Request) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { data, error } = await getSupabaseAdmin()
    .from("extintores")
    .select(
      "codigo,pavimento,local,n_inmetro,tipo,tamanho,capacidade,vencimento_nivel_2,vencimento_nivel_3"
    )
    .order("codigo", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row) => ({
    CÓDIGO: row.codigo,
    SETOR: row.pavimento,
    "LOCAL DETALHADO": row.local,
    "NÚMERO DO INMETRO": row.n_inmetro,
    TIPO: row.tipo,
    TAMANHO: row.tamanho,
    "CAPACIDADE EXTINTORA": row.capacidade,
    "VENCIMENTO MANUTENÇÃO NÍVEL 2": formatDateBr(row.vencimento_nivel_2),
    "VENCIMENTO MANUTENÇÃO NÍVEL 3": formatDateBr(row.vencimento_nivel_3)
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ CÓDIGO: "" }]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Extintores");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="extintores_${stamp}.xlsx"`
    }
  });
}
