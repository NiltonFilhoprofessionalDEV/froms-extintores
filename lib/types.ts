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
  /** Última inspeção registrada: vermelho até nova conferência sem itens não conformes (não zera ao virar o mês). */
  status_mes: StatusMesPainel;
};

/** Cadastro de hidrante — colunas da planilha de importação. */
export type Hidrante = {
  codigo: string;
  pavimento: string;
  local_detalhado: string;
  quantidade_mangueiras: number;
  data_teste_hidrostatico_m1: string | null;
  data_teste_hidrostatico_m2: string | null;
  data_teste_hidrostatico_m3: string | null;
  data_teste_hidrostatico_m4: string | null;
  quantidade_chaves_storz: number;
  quantidade_esguicho: number;
};

export type HidranteStatusMes = {
  codigo: string;
  /** Mesma regra do painel de extintores (última inspeção global). */
  status_mes: StatusMesPainel;
};
