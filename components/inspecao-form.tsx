"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Minus, AlertTriangle, Loader2 } from "lucide-react";
import { EQUIPES, isEquipe, type Equipe } from "@/lib/equipes";
import { PERGUNTAS_EXTINTOR, PERGUNTAS_HIDRANTE } from "@/lib/perguntas-inspecao";

export type ModoInspecao = "extintor" | "hidrante";

type Props = {
  codigo: string;
  modo?: ModoInspecao;
};

export function InspecaoForm({ codigo, modo = "extintor" }: Props) {
  const router = useRouter();
  const [conferente, setConferente] = useState("");
  const [equipe, setEquipe] = useState<Equipe | "">("");
  const [observacoes, setObservacoes] = useState("");
  const [respostas, setRespostas] = useState<Record<number, Resposta | null>>({
    1: null, 2: null, 3: null, 4: null,
    5: null, 6: null, 7: null, 8: null
  });
  const [justificativasNc, setJustificativasNc] = useState<Record<number, string>>({
    1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function salvarInspecao() {
    setMessage(null);

    if (!conferente.trim()) {
      setMessage("Informe o nome do conferente.");
      return;
    }
    if (!equipe) {
      setMessage("Selecione a equipe.");
      return;
    }
    if (Object.values(respostas).some((v) => v === null)) {
      setMessage("Responda todas as perguntas antes de salvar.");
      return;
    }
    for (let n = 1; n <= 8; n++) {
      if (respostas[n] === "nao_conforme" && !justificativasNc[n].trim()) {
        setMessage(`Preencha o detalhamento obrigatório da pergunta ${n} (não conforme).`);
        return;
      }
    }

    setLoading(true);
    try {
      const apiUrl = modo === "hidrante" ? "/api/inspecoes-hidrantes" : "/api/inspecoes";
      const blocoJustificativas = {
        justificativa_nc_1: justificativasNc[1].trim(),
        justificativa_nc_2: justificativasNc[2].trim(),
        justificativa_nc_3: justificativasNc[3].trim(),
        justificativa_nc_4: justificativasNc[4].trim(),
        justificativa_nc_5: justificativasNc[5].trim(),
        justificativa_nc_6: justificativasNc[6].trim(),
        justificativa_nc_7: justificativasNc[7].trim(),
        justificativa_nc_8: justificativasNc[8].trim()
      };
      const blocoPerguntas = {
        pergunta_1: respostas[1], pergunta_2: respostas[2],
        pergunta_3: respostas[3], pergunta_4: respostas[4],
        pergunta_5: respostas[5], pergunta_6: respostas[6],
        pergunta_7: respostas[7], pergunta_8: respostas[8]
      };
      const payload =
        modo === "hidrante"
          ? { hidrante_id: codigo, conferente: conferente.trim(), equipe, observacoes: observacoes.trim(), ...blocoPerguntas, ...blocoJustificativas }
          : { extintor_id: codigo, conferente: conferente.trim(), equipe, observacoes: observacoes.trim(), ...blocoPerguntas, ...blocoJustificativas };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Falha ao salvar inspeção.");
        return;
      }

      router.push(modo === "hidrante" ? "/hidrantes" : "/extintores");
      router.refresh();
    } catch {
      setMessage("Erro inesperado ao salvar inspeção.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Conferente */}
      <FormField label="Conferente" required>
        <input
          value={conferente}
          onChange={(e) => setConferente(e.target.value)}
          className={inputClass}
          placeholder="Nome completo do conferente"
        />
      </FormField>

      {/* Equipe */}
      <FormField label="Equipe" required>
        <select
          value={equipe}
          onChange={(e) => {
            const v = e.target.value;
            setEquipe(isEquipe(v) ? v : "");
          }}
          className={inputClass}
        >
          <option value="">Selecione a equipe</option>
          {EQUIPES.map((nome) => (
            <option key={nome} value={nome}>{nome}</option>
          ))}
        </select>
      </FormField>

      {/* Perguntas */}
      <div className="space-y-3">
        {(modo === "hidrante" ? PERGUNTAS_HIDRANTE : PERGUNTAS_EXTINTOR).map((texto, idx) => {
          const numero = idx + 1;
          return (
            <QuestionGroup
              key={numero}
              numero={numero}
              titulo={texto}
              value={respostas[numero]}
              onChange={(value) => {
                setRespostas((prev) => ({ ...prev, [numero]: value }));
                if (value !== "nao_conforme") {
                  setJustificativasNc((prev) => ({ ...prev, [numero]: "" }));
                }
              }}
              justificativaNc={justificativasNc[numero]}
              onJustificativaNcChange={(t) =>
                setJustificativasNc((prev) => ({ ...prev, [numero]: t }))
              }
            />
          );
        })}
      </div>

      {/* Observações */}
      <FormField label="Observações gerais">
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className={`${inputClass} min-h-24 resize-y`}
          placeholder="Observações adicionais (opcional)..."
        />
      </FormField>

      {/* Mensagem de erro */}
      {message ? (
        <div className="flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </div>
      ) : null}

      {/* Botões */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={salvarInspecao}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Confirmar Inspeção"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push(modo === "hidrante" ? "/hidrantes" : "/extintores")}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function FormField({
  label,
  required = false,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-danger-600">*</span>}
      </span>
      {children}
    </label>
  );
}

type Resposta = "conforme" | "nao_conforme" | "na";

function QuestionGroup({
  numero,
  titulo,
  value,
  onChange,
  justificativaNc,
  onJustificativaNcChange
}: {
  numero: number;
  titulo: string;
  value: Resposta | null;
  onChange: (value: Resposta) => void;
  justificativaNc: string;
  onJustificativaNcChange: (texto: string) => void;
}) {
  const answered = value !== null;

  return (
    <div
      className={`rounded-xl border p-3.5 transition ${
        answered
          ? value === "nao_conforme"
            ? "border-danger-200 bg-danger-50/60"
            : value === "conforme"
              ? "border-success-200 bg-success-50/60"
              : "border-slate-200 bg-slate-50/60"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      {/* Cabeçalho */}
      <p className="mb-3 flex items-start gap-2.5 text-sm font-medium text-slate-800">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
          {numero}
        </span>
        {titulo}
      </p>

      {/* Botões de resposta */}
      <div className="grid grid-cols-3 gap-2">
        <RespostaBtn
          label="Conforme"
          icon={<CheckCircle2 className="h-4 w-4" />}
          active={value === "conforme"}
          activeClass="border-success-600 bg-success-500 text-white"
          inactiveClass="border-slate-200 bg-white text-slate-700 hover:bg-success-50 hover:border-success-300"
          onClick={() => onChange("conforme")}
        />
        <RespostaBtn
          label="Não Conforme"
          icon={<XCircle className="h-4 w-4" />}
          active={value === "nao_conforme"}
          activeClass="border-danger-700 bg-danger-500 text-white"
          inactiveClass="border-slate-200 bg-white text-slate-700 hover:bg-danger-50 hover:border-danger-300"
          onClick={() => onChange("nao_conforme")}
        />
        <RespostaBtn
          label="N/A"
          icon={<Minus className="h-4 w-4" />}
          active={value === "na"}
          activeClass="border-slate-700 bg-slate-600 text-white"
          inactiveClass="border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          onClick={() => onChange("na")}
        />
      </div>

      {/* Justificativa obrigatória */}
      {value === "nao_conforme" ? (
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-danger-700">
            Detalhamento obrigatório <span className="text-danger-600">*</span>
          </span>
          <textarea
            value={justificativaNc}
            onChange={(e) => onJustificativaNcChange(e.target.value)}
            className="min-h-20 w-full rounded-xl border-2 border-danger-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-danger-400 focus:ring-2 focus:ring-danger-100"
            placeholder="Descreva o que foi encontrado e o que precisa ser corrigido."
            required
          />
        </label>
      ) : null}
    </div>
  );
}

function RespostaBtn({
  label,
  icon,
  active,
  activeClass,
  inactiveClass,
  onClick
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  activeClass: string;
  inactiveClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 text-xs font-bold transition sm:flex-row sm:gap-1.5 sm:text-sm ${
        active ? activeClass : inactiveClass
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
