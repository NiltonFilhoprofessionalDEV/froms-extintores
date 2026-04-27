import Link from "next/link";
import { getSupabase, getSupabaseAdminOrNull } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type InspecaoHistorico = {
  id: string;
  extintor_id: string;
  conferente: string;
  data_inspecao: string;
  observacoes: string;
  pergunta_1: Resposta;
  pergunta_2: Resposta;
  pergunta_3: Resposta;
  pergunta_4: Resposta;
  pergunta_5: Resposta;
  pergunta_6: Resposta;
  pergunta_7: Resposta;
  pergunta_8: Resposta;
};

type Resposta = "conforme" | "nao_conforme" | "na";

const PERGUNTAS = [
  "O local do extintor está correto conforme o mapa?",
  "Os dados do extintor estão corretos?",
  "Sinalização está correta?",
  "Mangueira está em boas condições?",
  "O bico ou difusor estão em boas condições?",
  "A alça de transporte, gatilho, lacre e pino estão em boas condições?",
  "O medidor de pressão está correto?",
  "O cilindro está em boas condições?"
] as const;

export default async function HistoricoPage() {
  const client = getSupabaseAdminOrNull() ?? getSupabase();
  const { data, error } = await client
    .from("inspecoes")
    .select(
      "id,extintor_id,conferente,data_inspecao,observacoes,pergunta_1,pergunta_2,pergunta_3,pergunta_4,pergunta_5,pergunta_6,pergunta_7,pergunta_8"
    )
    .order("data_inspecao", { ascending: false });

  const inspecoes = (data ?? []) as InspecaoHistorico[];
  const gruposPorMes = groupInspecoesByMes(inspecoes);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-4 sm:p-6">
      <section className="rounded-2xl border-2 border-slate-900 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-xl font-black sm:text-2xl">HISTÓRICO DE INSPEÇÕES</h1>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Voltar
          </Link>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
            Erro ao carregar histórico: {error.message}
          </p>
        ) : null}

        <div className="space-y-3">
          {!error && inspecoes.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Nenhuma conferência registrada ainda.
            </p>
          ) : null}

          {gruposPorMes.map((grupo) => (
            <details key={grupo.key} open className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-black text-slate-800">{grupo.label}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {grupo.inspecoes.length} inspeção(ões)
                  </span>
                </div>
              </summary>

              <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
                {grupo.inspecoes.map((inspecao) => {
                  const respostas = [
                    inspecao.pergunta_1,
                    inspecao.pergunta_2,
                    inspecao.pergunta_3,
                    inspecao.pergunta_4,
                    inspecao.pergunta_5,
                    inspecao.pergunta_6,
                    inspecao.pergunta_7,
                    inspecao.pergunta_8
                  ];
                  const possuiNaoConforme = respostas.some((resposta) => resposta === "nao_conforme");

                  return (
                    <details
                      key={inspecao.id}
                      className={`rounded-xl border-2 p-4 ${
                        possuiNaoConforme
                          ? "border-red-300 bg-red-50"
                          : "border-green-300 bg-green-50"
                      }`}
                    >
                      <summary className="cursor-pointer list-none">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-base font-bold">Extintor {inspecao.extintor_id}</p>
                          <p className="text-sm font-semibold text-slate-700">{inspecao.conferente}</p>
                          <p className="text-sm text-slate-600">{formatDateTime(inspecao.data_inspecao)}</p>
                        </div>
                      </summary>

                      <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 text-sm">
                        {PERGUNTAS.map((pergunta, idx) => {
                          const resposta = respostas[idx];
                          return (
                            <p key={pergunta}>
                              <span className="font-semibold">
                                {idx + 1}. {pergunta}
                              </span>{" "}
                              <span className={respostaClass(resposta)}>{formatResposta(resposta)}</span>
                            </p>
                          );
                        })}

                        <p>
                          <span className="font-semibold">Observações:</span>{" "}
                          {inspecao.observacoes?.trim() ? inspecao.observacoes : "Sem observações"}
                        </p>
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}

function groupInspecoesByMes(inspecoes: InspecaoHistorico[]) {
  const map = new Map<string, InspecaoHistorico[]>();

  for (const inspecao of inspecoes) {
    const date = new Date(inspecao.data_inspecao);
    const key = Number.isNaN(date.getTime())
      ? "Sem data"
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)?.push(inspecao);
  }

  return [...map.entries()]
    .map(([key, grouped]) => ({
      key,
      label: key === "Sem data" ? key : formatMesAno(key),
      inspecoes: grouped
    }))
    .sort((a, b) => (a.key < b.key ? 1 : -1));
}

function formatMesAno(yearMonth: string) {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function formatResposta(value: Resposta) {
  if (value === "conforme") return "Conforme";
  if (value === "nao_conforme") return "Não Conforme";
  return "N/A";
}

function respostaClass(value: Resposta) {
  if (value === "conforme") return "font-bold text-green-700";
  if (value === "nao_conforme") return "font-bold text-red-700";
  return "font-bold text-slate-600";
}
