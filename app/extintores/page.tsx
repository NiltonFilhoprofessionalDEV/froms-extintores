import Link from "next/link";
import { ChevronLeft, Flame } from "lucide-react";
import { getSupabase, getSupabaseAdminOrNull } from "@/lib/supabase";
import type { ExtintorStatusMes, StatusMesPainel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ExtintoresPainelPage() {
  const client = getSupabaseAdminOrNull() ?? getSupabase();
  const { data, error } = await client.rpc("painel_extintores_status_mes");

  const extintores = (data ?? []) as ExtintorStatusMes[];
  const total = extintores.length;
  const conformes = extintores.filter((e) => e.status_mes === "conforme").length;
  const naoConformes = extintores.filter((e) => e.status_mes === "nao_conforme").length;
  const semInspecao = total - conformes - naoConformes;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-6 sm:px-6">
      {/* Page header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-600">
            <Flame className="h-5 w-5 text-white" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-2xl">
              Extintores
            </h1>
            <p className="text-xs text-slate-500">Selecione o número do extintor</p>
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryCard value={conformes} label="Conformes" color="success" />
        <SummaryCard value={naoConformes} label="Não conformes" color="danger" />
        <SummaryCard value={semInspecao} label="Sem inspeção" color="neutral" />
      </div>

      {/* Card com grid */}
      <div className="rounded-2xl bg-white p-4 shadow-card sm:p-6">
        {error ? (
          <p className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">
            Erro ao consultar extintores: {error.message}
          </p>
        ) : null}

        {/* Legenda */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-500">
          <LegendItem color="bg-white border border-slate-200" label="Sem inspeção" />
          <LegendItem color="bg-success-500" label="Última inspeção OK" />
          <LegendItem color="bg-danger-500" label="Não conforme" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {extintores.map((extintor) => (
            <Link
              key={extintor.codigo}
              href={
                extintor.status_mes === "nao_conforme"
                  ? `/extintor/${encodeURIComponent(extintor.codigo)}?correcao=1`
                  : `/extintor/${encodeURIComponent(extintor.codigo)}`
              }
              title={
                extintor.status_mes === "nao_conforme"
                  ? "Ver não conformidade para corrigir"
                  : undefined
              }
              className={`flex h-14 items-center justify-center rounded-xl text-base font-bold shadow-sm transition active:scale-95 sm:h-16 sm:text-lg ${painelClass(
                extintor.status_mes
              )}`}
            >
              {extintor.codigo}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  value,
  label,
  color
}: {
  value: number;
  label: string;
  color: "success" | "danger" | "neutral";
}) {
  const styles = {
    success: "bg-success-50 text-success-700",
    danger: "bg-danger-50 text-danger-700",
    neutral: "bg-slate-50 text-slate-600"
  };
  return (
    <div className={`rounded-xl px-3 py-2.5 text-center ${styles[color]}`}>
      <p className="text-2xl font-extrabold leading-none sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium">{label}</p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

function painelClass(status: StatusMesPainel | string | undefined) {
  if (status === "nao_conforme") {
    return "bg-danger-500 text-white hover:bg-danger-600";
  }
  if (status === "conforme") {
    return "bg-success-500 text-white hover:bg-success-600";
  }
  return "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50";
}
