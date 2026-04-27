import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { assertAdminAccess, getSupabaseAdmin } from "@/lib/admin-api";

function formatResposta(value: string) {
  if (value === "conforme") return "Conforme";
  if (value === "nao_conforme") return "Nao conforme";
  return "N/A";
}

function formatDateTimeBr(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(d);
}

export async function GET(request: Request) {
  const denied = assertAdminAccess(request);
  if (denied) return denied;

  const { data, error } = await getSupabaseAdmin()
    .from("inspecoes")
    .select(
      "id,extintor_id,data_inspecao,conferente,equipe,observacoes,pergunta_1,pergunta_2,pergunta_3,pergunta_4,pergunta_5,pergunta_6,pergunta_7,pergunta_8,justificativa_nc_1,justificativa_nc_2,justificativa_nc_3,justificativa_nc_4,justificativa_nc_5,justificativa_nc_6,justificativa_nc_7,justificativa_nc_8"
    )
    .order("data_inspecao", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row) => ({
    "ID": row.id,
    "CODIGO EXTINTOR": row.extintor_id,
    "DATA/HORA": formatDateTimeBr(row.data_inspecao),
    "CONFERENTE": row.conferente,
    "EQUIPE": row.equipe ?? "",
    "OBSERVACOES": row.observacoes ?? "",
    "P1 - Mapa": formatResposta(row.pergunta_1),
    "P1 - Detalhe NC": row.justificativa_nc_1 ?? "",
    "P2 - Dados": formatResposta(row.pergunta_2),
    "P2 - Detalhe NC": row.justificativa_nc_2 ?? "",
    "P3 - Sinalizacao": formatResposta(row.pergunta_3),
    "P3 - Detalhe NC": row.justificativa_nc_3 ?? "",
    "P4 - Mangueira": formatResposta(row.pergunta_4),
    "P4 - Detalhe NC": row.justificativa_nc_4 ?? "",
    "P5 - Bico/difusor": formatResposta(row.pergunta_5),
    "P5 - Detalhe NC": row.justificativa_nc_5 ?? "",
    "P6 - Alca/gatilho/lacre/pino": formatResposta(row.pergunta_6),
    "P6 - Detalhe NC": row.justificativa_nc_6 ?? "",
    "P7 - Pressao": formatResposta(row.pergunta_7),
    "P7 - Detalhe NC": row.justificativa_nc_7 ?? "",
    "P8 - Cilindro": formatResposta(row.pergunta_8),
    "P8 - Detalhe NC": row.justificativa_nc_8 ?? ""
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "ID": "" }]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Conferencias");

  const arrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="conferencias_${stamp}.xlsx"`
    }
  });
}
