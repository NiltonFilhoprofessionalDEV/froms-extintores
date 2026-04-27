"use client";

import { useState, type FormEvent } from "react";
import { Upload } from "lucide-react";

export function ImportExcelForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("arquivo");

    if (!(file instanceof File)) {
      setMessage("Selecione um arquivo .xlsx ou .xls");
      return;
    }
    if (!adminKey.trim()) {
      setMessage("Informe a chave de administrador.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/import-extintores", {
        method: "POST",
        headers: {
          "x-admin-key": adminKey.trim()
        },
        body: formData
      });
      const raw = await response.text();
      let payload: { message?: string; error?: string; invalid_rows?: unknown } = {};
      try {
        payload = raw ? (JSON.parse(raw) as typeof payload) : {};
      } catch {
        payload = { error: raw || "Falha ao importar planilha." };
      }

      if (!response.ok) {
        const hasInvalidRows = Array.isArray(payload.invalid_rows) && payload.invalid_rows.length > 0;
        setMessage(
          hasInvalidRows
            ? `${payload.error ?? "Planilha inválida."} Verifique os detalhes no log do servidor.`
            : payload.error ?? "Falha ao importar planilha."
        );
        return;
      }

      form.reset();
      setAdminKey("");
      setMessage(payload.message ?? "Importação realizada.");
    } catch {
      setMessage("Erro inesperado ao importar planilha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex w-full flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm"
    >
      <p className="text-sm font-semibold text-slate-700">Importar extintores via Excel</p>
      <input
        required
        value={adminKey}
        onChange={(event) => setAdminKey(event.target.value)}
        type="password"
        placeholder="Chave de administrador"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      <input
        required
        name="arquivo"
        type="file"
        accept=".xlsx,.xls"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        <Upload size={18} />
        {loading ? "Importando..." : "Importar"}
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
