"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type Props = {
  adminKey: string;
};

export function AdminExcelExports({ adminKey }: Props) {
  const [loadingExt, setLoadingExt] = useState(false);
  const [loadingIns, setLoadingIns] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function download(url: string, filenameHint: string, setLoading: (v: boolean) => void) {
    setMessage(null);
    const key = adminKey.trim();
    if (!key) {
      setMessage("Informe a chave de administrador acima para exportar.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: { "x-admin-key": key }
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const j = JSON.parse(text) as { error?: string };
          setMessage(j.error ?? "Falha na exportação.");
        } catch {
          setMessage(text || "Falha na exportação.");
        }
        return;
      }

      const blob = await response.blob();
      const cd = response.headers.get("Content-Disposition");
      let filename = filenameHint;
      const match = cd?.match(/filename="([^"]+)"/);
      if (match?.[1]) filename = match[1];

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setMessage("Erro inesperado ao exportar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 flex w-full flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-700">Exportar para Excel</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={loadingExt}
          onClick={() =>
            download("/api/export-extintores", "extintores.xlsx", setLoadingExt)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-700 bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <Download size={18} />
          {loadingExt ? "Gerando..." : "Exportar extintores"}
        </button>
        <button
          type="button"
          disabled={loadingIns}
          onClick={() =>
            download("/api/export-inspecoes", "conferencias.xlsx", setLoadingIns)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-800 bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          <Download size={18} />
          {loadingIns ? "Gerando..." : "Exportar conferências"}
        </button>
      </div>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  );
}
