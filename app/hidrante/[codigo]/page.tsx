import Link from "next/link";
import { ChevronLeft, Droplets } from "lucide-react";
import { ChecklistNaoConformeResumo } from "@/components/checklist-nao-conforme-resumo";
import { InspecaoForm } from "@/components/inspecao-form";
import { PERGUNTAS_HIDRANTE } from "@/lib/perguntas-inspecao";
import { getSupabase, getSupabaseAdminOrNull } from "@/lib/supabase";
import { fetchUltimaInspecaoNaoConformeMesHidrante } from "@/lib/ultima-inspecao-mes";
import type { Hidrante } from "@/lib/types";

type Props = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ correcao?: string }>;
};

export const dynamic = "force-dynamic";

export default async function HidrantePage({ params, searchParams }: Props) {
  const { codigo } = await params;
  const { correcao } = await searchParams;
  const codigoNormalizado = decodeURIComponent(codigo).trim();
  const client = getSupabaseAdminOrNull() ?? getSupabase();
  const codigosTentativa = buildCodigoAlternatives(codigoNormalizado);
  let data: Hidrante | null = null;
  let error: Error | null = null;

  const selectCols =
    "codigo,pavimento,local_detalhado,quantidade_mangueiras,data_teste_hidrostatico_m1,data_teste_hidrostatico_m2,data_teste_hidrostatico_m3,data_teste_hidrostatico_m4,quantidade_chaves_storz,quantidade_esguicho";

  for (const codigoBusca of codigosTentativa) {
    const response = await client
      .from("hidrantes")
      .select(selectCols)
      .eq("codigo", codigoBusca)
      .maybeSingle<Hidrante>();

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
      <main className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-8">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-card">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
            <Droplets className="h-6 w-6 text-brand-700" />
          </span>
          <h1 className="text-lg font-extrabold text-slate-900">Hidrante não encontrado</h1>
          <p className="mt-1 text-sm text-slate-500">
            Código <span className="font-semibold text-slate-700">{codigoNormalizado}</span> não localizado.
          </p>
          {error ? <p className="mt-2 text-xs text-danger-600">{error.message}</p> : null}
          <Link
            href="/hidrantes"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar ao painel
          </Link>
        </div>
      </main>
    );
  }

  const mostrarResumoNc = correcao === "1";
  const resumoNc =
    mostrarResumoNc && data
      ? await fetchUltimaInspecaoNaoConformeMesHidrante(client, data.codigo)
      : null;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/hidrantes"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700">
            <Droplets className="h-5 w-5 text-white" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Hidrante</p>
            <h1 className="text-xl font-extrabold leading-tight text-slate-900">
              N° {data.codigo}
            </h1>
          </div>
        </div>
      </div>

      {/* Aviso RPC indisponível */}
      {mostrarResumoNc && !resumoNc ? (
        <div className="mb-4 rounded-xl border border-warn-600/30 bg-warn-50 px-4 py-3 text-sm text-warn-700">
          Não foi possível carregar o resumo da não conforme. Verifique se as funções RPC foram
          criadas no Supabase (
          <code className="rounded bg-warn-100 px-1 text-xs">
            db/migrate-rpc-resumo-nc-correcao.sql
          </code>
          ).
        </div>
      ) : null}

      {/* Resumo não conforme */}
      {resumoNc ? (
        <div className="mb-4">
          <ChecklistNaoConformeResumo inspecao={resumoNc} perguntas={PERGUNTAS_HIDRANTE} />
        </div>
      ) : null}

      {/* Ficha técnica */}
      <div className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Dados do equipamento
        </p>
        <dl className="grid grid-cols-1 gap-y-2 text-sm sm:grid-cols-2 sm:gap-x-6">
          <InfoItem label="Pavimento" value={data.pavimento} />
          <InfoItem label="Local detalhado" value={data.local_detalhado} />
          <InfoItem label="Qtd. mangueiras" value={String(data.quantidade_mangueiras)} />
          <InfoItem label="Qtd. chaves STORZ" value={String(data.quantidade_chaves_storz)} />
          <InfoItem label="Qtd. esguicho" value={String(data.quantidade_esguicho)} />
          <InfoItem
            label="Teste hidrostático M-1"
            value={formatDateOrDash(data.data_teste_hidrostatico_m1)}
          />
          <InfoItem
            label="Teste hidrostático M-2"
            value={formatDateOrDash(data.data_teste_hidrostatico_m2)}
          />
          <InfoItem
            label="Teste hidrostático M-3"
            value={formatDateOrDash(data.data_teste_hidrostatico_m3)}
          />
          <InfoItem
            label="Teste hidrostático M-4"
            value={formatDateOrDash(data.data_teste_hidrostatico_m4)}
          />
        </dl>
      </div>

      {/* Formulário */}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-card sm:p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Checklist de inspeção
        </p>
        <InspecaoForm codigo={data.codigo} modo="hidrante" />
      </div>
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

function InfoItem({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function formatDateOrDash(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}
