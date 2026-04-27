/** Quando `pergunta_n` = nao_conforme, `justificativa_nc_n` deve vir preenchida (trim não vazio). */
export function validarJustificativasNaoConforme(body: {
  pergunta_1: string;
  pergunta_2: string;
  pergunta_3: string;
  pergunta_4: string;
  pergunta_5: string;
  pergunta_6: string;
  pergunta_7: string;
  pergunta_8: string;
  justificativa_nc_1?: unknown;
  justificativa_nc_2?: unknown;
  justificativa_nc_3?: unknown;
  justificativa_nc_4?: unknown;
  justificativa_nc_5?: unknown;
  justificativa_nc_6?: unknown;
  justificativa_nc_7?: unknown;
  justificativa_nc_8?: unknown;
}): string | null {
  for (let n = 1; n <= 8; n++) {
    const pergunta = body[`pergunta_${n}` as keyof typeof body] as string;
    const jus = String(body[`justificativa_nc_${n}` as keyof typeof body] ?? "").trim();
    if (pergunta === "nao_conforme" && !jus) {
      return `Preencha o detalhamento obrigatório da pergunta ${n} (não conforme).`;
    }
  }
  return null;
}

export function justificativasNcParaInsert(body: {
  justificativa_nc_1?: unknown;
  justificativa_nc_2?: unknown;
  justificativa_nc_3?: unknown;
  justificativa_nc_4?: unknown;
  justificativa_nc_5?: unknown;
  justificativa_nc_6?: unknown;
  justificativa_nc_7?: unknown;
  justificativa_nc_8?: unknown;
}) {
  return {
    justificativa_nc_1: String(body.justificativa_nc_1 ?? "").trim(),
    justificativa_nc_2: String(body.justificativa_nc_2 ?? "").trim(),
    justificativa_nc_3: String(body.justificativa_nc_3 ?? "").trim(),
    justificativa_nc_4: String(body.justificativa_nc_4 ?? "").trim(),
    justificativa_nc_5: String(body.justificativa_nc_5 ?? "").trim(),
    justificativa_nc_6: String(body.justificativa_nc_6 ?? "").trim(),
    justificativa_nc_7: String(body.justificativa_nc_7 ?? "").trim(),
    justificativa_nc_8: String(body.justificativa_nc_8 ?? "").trim()
  };
}
