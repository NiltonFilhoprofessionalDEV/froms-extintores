import * as XLSX from "xlsx";

export function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeRowKeys(row: Record<string, unknown>) {
  return Object.entries(row).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});
}

export function getRowValue(row: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (alias in row) {
      return row[alias];
    }
  }
  return "";
}

export function excelDateToIso(value: unknown): string {
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

/** Inteiro >= 0; célula vazia ou inválida retorna null. */
export function parseQuantity(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const n = Math.trunc(value);
    return n >= 0 ? n : null;
  }
  const s = String(value).trim();
  if (s === "") return null;
  const n = parseInt(s, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}
