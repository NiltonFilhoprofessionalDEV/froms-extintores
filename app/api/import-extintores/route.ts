import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { supabaseAdmin } from "@/lib/supabase";

type ExtintorImport = {
  codigo: string;
  pavimento: string;
  local: string;
  n_inmetro: string;
  tipo: string;
  tamanho: string;
  capacidade: string;
  vencimento_nivel_2: string;
  vencimento_nivel_3: string;
};

type InvalidRow = {
  line: number;
  errors: string[];
};

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeRowKeys(row: Record<string, unknown>) {
  return Object.entries(row).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});
}

function getRowValue(row: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (alias in row) {
      return row[alias];
    }
  }
  return "";
}

function excelDateToIso(value: unknown): string {
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) return "";
    return new Date(date.y, date.m - 1, date.d).toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const normalized = trimmed.includes("/")
      ? trimmed.split("/").reverse().join("-")
      : trimmed;
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return "";
}

export async function POST(request: Request) {
  try {
    const adminImportKey = process.env.ADMIN_IMPORT_KEY;
    const sentKey = request.headers.get("x-admin-key");

    if (!adminImportKey) {
      return NextResponse.json(
        { error: "Defina ADMIN_IMPORT_KEY no ambiente para proteger a importação." },
        { status: 500 }
      );
    }

    if (!sentKey || sentKey !== adminImportKey) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Defina SUPABASE_SERVICE_ROLE_KEY para permitir importação." },
        { status: 500 }
      );
    }

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

    const payload: ExtintorImport[] = [];
    const invalidRows: InvalidRow[] = [];

    rows.forEach((rawRow, index) => {
      const row = normalizeRowKeys(rawRow);
      const mapped: ExtintorImport = {
        codigo: String(getRowValue(row, ["codigo"])).trim(),
        pavimento: String(getRowValue(row, ["setor", "pavimento"])).trim(),
        local: String(getRowValue(row, ["local_detalhado", "local"])).trim(),
        n_inmetro: String(getRowValue(row, ["numero_do_inmetro", "n_inmetro"])).trim(),
        tipo: String(getRowValue(row, ["tipo"])).trim(),
        tamanho: String(getRowValue(row, ["tamanho"])).trim(),
        capacidade: String(getRowValue(row, ["capacidade_extintora", "capacidade"])).trim(),
        vencimento_nivel_2: excelDateToIso(
          getRowValue(row, ["vencimento_manutencao_nivel_2", "vencimento_nivel_2"])
        ),
        vencimento_nivel_3: excelDateToIso(
          getRowValue(row, ["vencimento_manutencao_nivel_3", "vencimento_nivel_3"])
        )
      };

      const errors: string[] = [];
      if (!mapped.codigo) errors.push("codigo ausente");
      if (!mapped.pavimento) errors.push("setor/pavimento ausente");
      if (!mapped.local) errors.push("local detalhado/local ausente");
      if (!mapped.n_inmetro) errors.push("numero do inmetro ausente");
      if (!mapped.tipo) errors.push("tipo ausente");
      if (!mapped.tamanho) errors.push("tamanho ausente");
      if (!mapped.capacidade) errors.push("capacidade extintora/capacidade ausente");
      if (!mapped.vencimento_nivel_2) errors.push("vencimento manutencao nivel 2 inválido");
      if (!mapped.vencimento_nivel_3) errors.push("vencimento manutencao nivel 3 inválido");

      if (errors.length > 0) {
        invalidRows.push({ line: index + 2, errors });
        return;
      }

      payload.push(mapped);
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

    const { error } = await supabaseAdmin.from("extintores").upsert(payload, {
      onConflict: "codigo"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Importação concluída com ${payload.length} registro(s).`
    });
  } catch (error) {
    console.error("Erro inesperado na importação:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a planilha. Verifique os formatos e tente novamente." },
      { status: 500 }
    );
  }
}
