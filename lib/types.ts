export type Extintor = {
  codigo: string;
  pavimento: string;
  local: string;
  n_inmetro: string;
  tipo: string;
  tamanho: string;
  capacidade: string;
  vencimento_nivel_2: string;
  vencimento_nivel_3: string;
};

export type StatusMesPainel = "pendente" | "conforme" | "nao_conforme";

export type ExtintorStatusMes = {
  codigo: string;
  /** Última inspeção do mês atual (várias inspeções no mês: vale a mais recente). */
  status_mes: StatusMesPainel;
};
