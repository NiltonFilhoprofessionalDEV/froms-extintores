import { NextResponse } from "next/server";
import { isEquipe } from "@/lib/equipes";
import {
  justificativasNcParaInsert,
  validarJustificativasNaoConforme
} from "@/lib/inspecao-justificativas-nc";
import { getSupabase, getSupabaseAdminOrNull } from "@/lib/supabase";

type Body = {
  hidrante_id?: string;
  conferente?: string;
  equipe?: string;
  observacoes?: string;
  pergunta_1?: Resposta;
  pergunta_2?: Resposta;
  pergunta_3?: Resposta;
  pergunta_4?: Resposta;
  pergunta_5?: Resposta;
  pergunta_6?: Resposta;
  pergunta_7?: Resposta;
  pergunta_8?: Resposta;
  justificativa_nc_1?: unknown;
  justificativa_nc_2?: unknown;
  justificativa_nc_3?: unknown;
  justificativa_nc_4?: unknown;
  justificativa_nc_5?: unknown;
  justificativa_nc_6?: unknown;
  justificativa_nc_7?: unknown;
  justificativa_nc_8?: unknown;
};

const respostasValidas = ["conforme", "nao_conforme", "na"] as const;
type Resposta = (typeof respostasValidas)[number];

function isRespostaValida(value: unknown): value is Resposta {
  return typeof value === "string" && respostasValidas.includes(value as Resposta);
}

export async function POST(request: Request) {
  const client = getSupabaseAdminOrNull() ?? getSupabase();
  const body = (await request.json()) as Body;

  if (
    !body.hidrante_id ||
    !body.conferente ||
    !isEquipe(body.equipe) ||
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
      { error: "Campos obrigatórios inválidos para salvar inspeção de hidrante." },
      { status: 400 }
    );
  }

  const jusErro = validarJustificativasNaoConforme({
    pergunta_1: body.pergunta_1,
    pergunta_2: body.pergunta_2,
    pergunta_3: body.pergunta_3,
    pergunta_4: body.pergunta_4,
    pergunta_5: body.pergunta_5,
    pergunta_6: body.pergunta_6,
    pergunta_7: body.pergunta_7,
    pergunta_8: body.pergunta_8,
    justificativa_nc_1: body.justificativa_nc_1,
    justificativa_nc_2: body.justificativa_nc_2,
    justificativa_nc_3: body.justificativa_nc_3,
    justificativa_nc_4: body.justificativa_nc_4,
    justificativa_nc_5: body.justificativa_nc_5,
    justificativa_nc_6: body.justificativa_nc_6,
    justificativa_nc_7: body.justificativa_nc_7,
    justificativa_nc_8: body.justificativa_nc_8
  });
  if (jusErro) {
    return NextResponse.json({ error: jusErro }, { status: 400 });
  }

  const { error } = await client.from("inspecoes_hidrantes").insert({
    hidrante_id: body.hidrante_id,
    conferente: body.conferente,
    equipe: body.equipe,
    observacoes: body.observacoes ?? "",
    pergunta_1: body.pergunta_1,
    pergunta_2: body.pergunta_2,
    pergunta_3: body.pergunta_3,
    pergunta_4: body.pergunta_4,
    pergunta_5: body.pergunta_5,
    pergunta_6: body.pergunta_6,
    pergunta_7: body.pergunta_7,
    pergunta_8: body.pergunta_8,
    ...justificativasNcParaInsert(body)
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
