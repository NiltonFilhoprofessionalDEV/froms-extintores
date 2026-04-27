import Link from "next/link";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { ExtintorStatusMes, StatusMesPainel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const client = supabaseAdmin ?? supabase;
  const { data, error } = await client
    .from("vw_extintores_status_mes")
    .select("codigo,status_mes")
    .order("codigo", { ascending: true });

  const extintores = (data ?? []) as ExtintorStatusMes[];

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-4 sm:p-6">
      <section className="rounded-2xl border-2 border-slate-900 bg-white p-4 sm:p-6">
        <h1 className="text-center text-2xl font-black tracking-wide sm:text-3xl">
          INSPEÇÃO EXTINTOR
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">Selecione o número do extintor</p>
        <div className="mb-4 mt-3 flex justify-end">
          <Link
            href="/historico"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Ver Histórico
          </Link>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
            Erro ao consultar status dos extintores: {error.message}
          </p>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-slate-900 bg-white" /> Sem inspeção no mês
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-green-800 bg-green-500" /> Última inspeção OK
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-red-800 bg-red-500" /> Última com não conforme
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {extintores.map((extintor) => (
            <Link
              key={extintor.codigo}
              href={`/extintor/${extintor.codigo}`}
              className={`flex h-16 items-center justify-center rounded-xl border-2 text-xl font-bold shadow-sm transition active:scale-95 sm:h-20 sm:text-2xl ${painelClass(
                extintor.status_mes
              )}`}
            >
              {extintor.codigo}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function painelClass(status: StatusMesPainel | string | undefined) {
  if (status === "nao_conforme") {
    return "border-red-800 bg-red-500 text-white";
  }
  if (status === "conforme") {
    return "border-green-800 bg-green-500 text-white";
  }
  return "border-slate-900 bg-white text-slate-900";
}
