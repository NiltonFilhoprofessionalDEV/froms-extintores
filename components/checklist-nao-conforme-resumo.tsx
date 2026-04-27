import { AlertTriangle, Clock, User, Users } from "lucide-react";
import type { InspecaoChecklistResumo } from "@/lib/types-inspecao-resumo";

type Props = {
  inspecao: InspecaoChecklistResumo;
  perguntas: readonly string[];
};

function formatarDataHora(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(d);
}

export function ChecklistNaoConformeResumo({ inspecao, perguntas }: Props) {
  const itensNc: { n: number; texto: string; justificativa: string }[] = [];
  for (let n = 1; n <= 8; n++) {
    const pk = `pergunta_${n}` as keyof InspecaoChecklistResumo;
    if (inspecao[pk] !== "nao_conforme") continue;
    const jk = `justificativa_nc_${n}` as keyof InspecaoChecklistResumo;
    const jus = String(inspecao[jk] ?? "").trim();
    itensNc.push({
      n,
      texto: perguntas[n - 1] ?? `Pergunta ${n}`,
      justificativa: jus || "(sem detalhamento registrado)"
    });
  }

  if (itensNc.length === 0) return null;

  return (
    <div className="rounded-2xl border border-danger-200 bg-danger-50 p-4 sm:p-5">
      {/* Título */}
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-danger-600">
          <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2} />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-danger-900">
            Última inspeção — não conforme
          </h2>
          <p className="mt-0.5 text-xs text-danger-700">
            O painel permanece vermelho até uma nova inspeção sem não conformidades.
          </p>
        </div>
      </div>

      {/* Meta-dados */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/70 p-3 text-xs sm:grid-cols-3">
        <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Data/hora" value={formatarDataHora(inspecao.data_inspecao)} />
        <MetaItem icon={<User className="h-3.5 w-3.5" />} label="Conferente" value={inspecao.conferente} />
        <MetaItem icon={<Users className="h-3.5 w-3.5" />} label="Equipe" value={inspecao.equipe ?? "—"} />
        {inspecao.observacoes?.trim() ? (
          <div className="col-span-2 sm:col-span-3">
            <p className="font-semibold text-slate-500">Obs. gerais</p>
            <p className="mt-0.5 whitespace-pre-wrap text-slate-700">{inspecao.observacoes.trim()}</p>
          </div>
        ) : null}
      </div>

      {/* Itens não conformes */}
      <ul className="space-y-2.5">
        {itensNc.map((item) => (
          <li
            key={item.n}
            className="rounded-xl border border-danger-200 bg-white p-3 shadow-sm"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-danger-600 text-xs font-bold text-white">
                {item.n}
              </span>
              <p className="text-xs font-bold uppercase tracking-wide text-danger-700">
                Item {item.n}
              </p>
            </div>
            <p className="mb-2 text-sm font-semibold text-slate-900">{item.texto}</p>
            <div className="rounded-lg bg-danger-50 px-2.5 py-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Detalhamento
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
                {item.justificativa}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 font-semibold text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 truncate text-slate-700">{value}</p>
    </div>
  );
}
