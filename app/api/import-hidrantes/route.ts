import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { assertAdminAccess, getSupabaseAdmin } from "@/lib/admin-api";
import {
  excelDateToIso,
  getRowValue,
  normalizeRowKeys,
  parseQuantity
} from "@/lib/excel-import-helpers";

/** Colunas alinhadas ao padrão da planilha (CÓDIGO, PAVIMENTO, LOCAL DETALHADO, …). */
type HidranteImport = {
  codigo: string;
  pavimento: string;
  local_detalhado: string;
  quantidade_mangueiras: number;
  data_teste_hidrostatico_m1: string | null;
  data_teste_hidrostatico_m2: string | null;
  data_teste_hidrostatico_m3: string | null;
  data_teste_hidrostatico_m4: string | null;
  quantidade_chaves_storz: number;
  quantidade_esguicho: number;
};

type InvalidRow = {
  line: number;
  errors: string[];
};

function optionalDateIso(value: unknown): string | null {
  const iso = excelDateToIso(value);
  return iso || null;
}

export async function POST(request: Request) {
  try {
    const denied = assertAdminAccess(request);
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get("arquivo");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo Excel inválido." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    if (!rows.length) {
      return NextResponse.json({ error: "Planilha vazia." }, { status: 400 });
    }

    const payload: HidranteImport[] = [];
    const invalidRows: InvalidRow[] = [];

    rows.forEach((rawRow, index) => {
      const row = normalizeRowKeys(rawRow);

      const qMang = parseQuantity(
        getRowValue(row, ["quantidade_de_mangueiras", "quantidade_mangueiras"])
      );
      const qStorz = parseQuantity(
        getRowValue(row, ["quantidade_de_chaves_storz", "quantidade_chaves_storz"])
      );
      const qEsg = parseQuantity(
        getRowValue(row, ["quantidade_de_esguicho", "quantidade_esguicho"])
      );

      const codigo = String(getRowValue(row, ["codigo"])).trim();
      const pavimento = String(getRowValue(row, ["pavimento"])).trim();
      const local_detalhado = String(
        getRowValue(row, ["local_detalhado", "local"])
      ).trim();

      const errors: string[] = [];
      if (!codigo) errors.push("codigo ausente");
      if (!pavimento) errors.push("pavimento ausente");
      if (!local_detalhado) errors.push("local detalhado ausente");
      if (qMang === null) errors.push("quantidade de mangueiras inválida ou vazia");
      if (qStorz === null) errors.push("quantidade de chaves storz inválida ou vazia");
      if (qEsg === null) errors.push("quantidade de esguicho inválida ou vazia");

      if (errors.length > 0) {
        invalidRows.push({ line: index + 2, errors });
        return;
      }

      payload.push({
        codigo,
        pavimento,
        local_detalhado,
        quantidade_mangueiras: qMang as number,
        data_teste_hidrostatico_m1: optionalDateIso(
          getRowValue(row, [
            "data_do_ultimo_teste_hidrostatico_m_1",
            "data_do_ultimo_teste_hidrostatico_m1",
            "data_ultimo_teste_hidrostatico_m1"
          ])
        ),
        data_teste_hidrostatico_m2: optionalDateIso(
          getRowValue(row, [
            "data_do_ultimo_teste_hidrostatico_m_2",
            "data_do_ultimo_teste_hidrostatico_m2"
          ])
        ),
        data_teste_hidrostatico_m3: optionalDateIso(
          getRowValue(row, [
            "data_do_ultimo_teste_hidrostatico_m_3",
            "data_do_ultimo_teste_hidrostatico_m3"
          ])
        ),
        data_teste_hidrostatico_m4: optionalDateIso(
          getRowValue(row, [
            "data_do_ultimo_teste_hidrostatico_m_4",
            "data_do_ultimo_teste_hidrostatico_m4"
          ])
        ),
        quantidade_chaves_storz: qStorz as number,
        quantidade_esguicho: qEsg as number
      });
    });

    if (!payload.length) {
      return NextResponse.json(
        {
          error: "Nenhuma linha válida encontrada.",
          invalid_rows: invalidRows
        },
        { status: 400 }
      );
    }

    if (invalidRows.length > 0) {
      return NextResponse.json(
        {
          error: "Planilha contém linhas inválidas. Corrija e tente novamente.",
          invalid_rows: invalidRows.slice(0, 20)
        },
        { status: 400 }
      );
    }

    const { error } = await getSupabaseAdmin().from("hidrantes").upsert(payload, {
      onConflict: "codigo"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Importação de hidrantes concluída com ${payload.length} registro(s).`
    });
  } catch (error) {
    console.error("Erro inesperado na importação de hidrantes:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a planilha. Verifique os formatos e tente novamente." },
      { status: 500 }
    );
  }
}
