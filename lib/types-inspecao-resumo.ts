/** Linha de inspeção para exibir resumo de não conformidades do mês. */
export type InspecaoChecklistResumo = {
  id: string;
  data_inspecao: string;
  conferente: string;
  equipe: string;
  observacoes: string | null;
  pergunta_1: string;
  pergunta_2: string;
  pergunta_3: string;
  pergunta_4: string;
  pergunta_5: string;
  pergunta_6: string;
  pergunta_7: string;
  pergunta_8: string;
  justificativa_nc_1: string | null;
  justificativa_nc_2: string | null;
  justificativa_nc_3: string | null;
  justificativa_nc_4: string | null;
  justificativa_nc_5: string | null;
  justificativa_nc_6: string | null;
  justificativa_nc_7: string | null;
  justificativa_nc_8: string | null;
};
