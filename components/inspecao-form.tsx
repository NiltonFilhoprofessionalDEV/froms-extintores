"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  codigo: string;
};

export function InspecaoForm({ codigo }: Props) {
  const router = useRouter();
  const [conferente, setConferente] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [respostas, setRespostas] = useState<Record<number, Resposta | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function salvarInspecao() {
    setMessage(null);

    if (!conferente.trim()) {
      setMessage("Informe o nome do conferente.");
      return;
    }
    if (Object.values(respostas).some((valor) => valor === null)) {
      setMessage("Responda todas as perguntas antes de salvar.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/inspecoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extintor_id: codigo,
          conferente: conferente.trim(),
          observacoes: observacoes.trim(),
          pergunta_1: respostas[1],
          pergunta_2: respostas[2],
          pergunta_3: respostas[3],
          pergunta_4: respostas[4],
          pergunta_5: respostas[5],
          pergunta_6: respostas[6],
          pergunta_7: respostas[7],
          pergunta_8: respostas[8]
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(payload.error ?? "Falha ao salvar inspeção.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Erro inesperado ao salvar inspeção.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-600">
          Conferente *
        </span>
        <input
          value={conferente}
          onChange={(event) => setConferente(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none ring-blue-200 focus:ring"
          placeholder="Digite o nome do conferente"
        />
      </label>

      {PERGUNTAS.map((texto, idx) => {
        const numero = idx + 1;
        return (
          <QuestionGroup
            key={numero}
            numero={numero}
            titulo={texto}
            value={respostas[numero]}
            onChange={(value) =>
              setRespostas((prev) => ({
                ...prev,
                [numero]: value
              }))
            }
          />
        );
      })}

      <label className="block">
        <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-600">
          Observações
        </span>
        <textarea
          value={observacoes}
          onChange={(event) => setObservacoes(event.target.value)}
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none ring-blue-200 focus:ring"
          placeholder="Observações adicionais (opcional)..."
        />
      </label>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={salvarInspecao}
          disabled={loading}
          className="w-full rounded-xl bg-red-400 px-4 py-4 text-base font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Confirmar Inspeção"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-700"
        >
          Cancelar
        </button>
      </div>

      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  );
}

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

function QuestionGroup({
  numero,
  titulo,
  value,
  onChange
}: {
  numero: number;
  titulo: string;
  value: Resposta | null;
  onChange: (value: Resposta) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {numero}
        </span>
        {titulo}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChange("conforme")}
          className={`rounded-xl border-2 px-3 py-4 text-sm font-bold sm:text-base ${
            value === "conforme"
              ? "border-green-700 bg-green-500 text-white"
              : "border-slate-300 bg-white text-slate-800"
          }`}
        >
          Conforme
        </button>
        <button
          type="button"
          onClick={() => onChange("nao_conforme")}
          className={`rounded-xl border-2 px-3 py-4 text-sm font-bold sm:text-base ${
            value === "nao_conforme"
              ? "border-red-700 bg-red-500 text-white"
              : "border-slate-300 bg-white text-slate-800"
          }`}
        >
          Não Conforme
        </button>
        <button
          type="button"
          onClick={() => onChange("na")}
          className={`rounded-xl border-2 px-3 py-4 text-sm font-bold sm:text-base ${
            value === "na"
              ? "border-slate-700 bg-slate-700 text-white"
              : "border-slate-300 bg-white text-slate-800"
          }`}
        >
          N/A
        </button>
      </div>
    </div>
  );
}
