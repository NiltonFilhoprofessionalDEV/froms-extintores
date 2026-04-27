import Link from "next/link";
import { InspecaoForm } from "@/components/inspecao-form";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { Extintor } from "@/lib/types";

type Props = {
  params: Promise<{ codigo: string }>;
};

export const dynamic = "force-dynamic";

export default async function ExtintorPage({ params }: Props) {
  const { codigo } = await params;
  const codigoNormalizado = decodeURIComponent(codigo).trim();
  const client = supabaseAdmin ?? supabase;
  const codigosTentativa = buildCodigoAlternatives(codigoNormalizado);
  let data: Extintor | null = null;
  let error: Error | null = null;

  for (const codigoBusca of codigosTentativa) {
    const response = await client
      .from("extintores")
      .select(
        "codigo,pavimento,local,n_inmetro,tipo,tamanho,capacidade,vencimento_nivel_2,vencimento_nivel_3"
      )
      .eq("codigo", codigoBusca)
      .maybeSingle<Extintor>();

    if (response.error) {
      error = response.error;
      continue;
    }
    if (response.data) {
      data = response.data;
      error = null;
      break;
    }
  }

  if (error || !data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-xl p-4 sm:p-6">
        <section className="rounded-2xl border-2 border-slate-900 bg-white p-6 text-center">
          <h1 className="text-2xl font-black text-slate-900">Extintor não encontrado</h1>
          <p className="mt-2 text-sm text-slate-600">
            Não foi possível abrir o código <span className="font-semibold">{codigoNormalizado}</span>.
          </p>
          {error ? <p className="mt-2 text-xs text-red-600">{error.message}</p> : null}
          <Link
            href="/"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Voltar ao painel
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl p-4 sm:p-6">
      <section className="rounded-2xl border-2 border-slate-900 bg-white p-4 sm:p-6">
        <h1 className="text-center text-3xl font-black">
          EXTINTOR N° <span className="text-red-600">{data.codigo}</span>
        </h1>

        <div className="mt-5 space-y-1 rounded-xl border bg-slate-50 p-4 text-sm">
          <InfoRow label="PAVIMENTO" value={data.pavimento} />
          <InfoRow label="LOCAL" value={data.local} />
          <InfoRow label="N° INMETRO" value={data.n_inmetro} />
          <InfoRow label="TIPO EXTINTOR" value={data.tipo} />
          <InfoRow label="TAMANHO" value={data.tamanho} />
          <InfoRow label="CAPACIDADE EXTINTORA" value={data.capacidade} />
          <InfoRow label="VENCIMENTO NÍVEL 2" value={formatDate(data.vencimento_nivel_2)} />
          <InfoRow label="VENCIMENTO NÍVEL 3" value={formatDate(data.vencimento_nivel_3)} />
        </div>

        <div className="mt-5">
          <InspecaoForm codigo={data.codigo} />
        </div>

        <Link
          href="/"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Voltar
        </Link>
      </section>
    </main>
  );
}

function buildCodigoAlternatives(rawCodigo: string) {
  const set = new Set<string>();
  set.add(rawCodigo);

  const onlyDigits = rawCodigo.replace(/\D/g, "");
  if (onlyDigits) {
    set.add(String(Number(onlyDigits)));
    set.add(onlyDigits.padStart(2, "0"));
    set.add(onlyDigits.padStart(3, "0"));
    set.add(`${Number(onlyDigits)}.0`);
  }

  return [...set].filter((value) => value.length > 0);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-bold">{label}:</span> {value}
    </p>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}
