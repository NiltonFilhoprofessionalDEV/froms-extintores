import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

type Body = {
  extintor_id?: string;
  conferente?: string;
  observacoes?: string;
  pergunta_1?: Resposta;
  pergunta_2?: Resposta;
  pergunta_3?: Resposta;
  pergunta_4?: Resposta;
  pergunta_5?: Resposta;
  pergunta_6?: Resposta;
  pergunta_7?: Resposta;
  pergunta_8?: Resposta;
};

const respostasValidas = ["conforme", "nao_conforme", "na"] as const;
type Resposta = (typeof respostasValidas)[number];

function isRespostaValida(value: unknown): value is Resposta {
  return typeof value === "string" && respostasValidas.includes(value as Resposta);
}

export async function POST(request: Request) {
  const client = supabaseAdmin ?? supabase;
  const body = (await request.json()) as Body;

  if (
    !body.extintor_id ||
    !body.conferente ||
    !isRespostaValida(body.pergunta_1) ||
    !isRespostaValida(body.pergunta_2) ||
    !isRespostaValida(body.pergunta_3) ||
    !isRespostaValida(body.pergunta_4) ||
    !isRespostaValida(body.pergunta_5) ||
    !isRespostaValida(body.pergunta_6) ||
    !isRespostaValida(body.pergunta_7) ||
    !isRespostaValida(body.pergunta_8)
  ) {
    return NextResponse.json(
      { error: "Campos obrigatórios inválidos para salvar inspeção." },
      { status: 400 }
    );
  }

  const { error } = await client.from("inspecoes").insert({
    extintor_id: body.extintor_id,
    conferente: body.conferente,
    observacoes: body.observacoes ?? "",
    pergunta_1: body.pergunta_1,
    pergunta_2: body.pergunta_2,
    pergunta_3: body.pergunta_3,
    pergunta_4: body.pergunta_4,
    pergunta_5: body.pergunta_5,
    pergunta_6: body.pergunta_6,
    pergunta_7: body.pergunta_7,
    pergunta_8: body.pergunta_8
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
