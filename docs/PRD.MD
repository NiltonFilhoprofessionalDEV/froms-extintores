PRD: App de Inspeção de Extintores (Baseado em Mockup)
1. Objetivo
Criar um aplicativo de checklist para inspeção mensal de extintores, com visualização em grade (grid) e status de cor em tempo real.

2. Tech Stack
Frontend: Next.js (App Router), Tailwind CSS.

Backend/Banco: Supabase (Auth + Database).

Ícones: Lucide React.

Planilhas: Biblioteca xlsx para importação massiva.

3. Arquitetura do Banco de Dados (Supabase)
Tabela extintores (Informações Fixas)
codigo: text (PK) - Ex: "1", "2"

pavimento: text

local: text

n_inmetro: text

tipo: text (ex: Água, PQS)

tamanho: text (ex: 10L, 6kg)

capacidade: text (ex: 2A)

vencimento_nivel_2: date

vencimento_nivel_3: date

Tabela inspecoes (Histórico)
id: uuid (PK)

extintor_id: text (FK -> extintores.codigo)

data_inspecao: timestamp (default: now())

conferente: text

pergunta_mapa: boolean (conforme/não conforme)

pergunta_dados: boolean (conforme/não conforme)

4. Requisitos Funcionais (Baseados no Desenho)
Tela 1: Grade de Seleção
Título: "INSPEÇÃO EXTINTOR".

Grade: Gerar botões de 1 até o limite de extintores cadastrados.

Lógica de Cor (Tempo Real):

Branco/Neutro: Extintor ainda não inspecionado no mês atual.

Verde: Extintor com pelo menos uma inspeção realizada no mês atual.

Navegação: Ao clicar no número, abre a "Tela de Inspeção".

Tela 2: Formulário de Inspeção
Cabeçalho Dinâmico: Exibir "EXTINTOR Nº [CÓDIGO CLICADO]".

Bloco de Informações (Somente Leitura): Exibir Pavimento, Local, Nº Inmetro, Tipo, Tamanho, Capacidade, Vencimento Nível 2 e Nível 3.

Campos de Entrada:

Input Text: Nome do Conferente.

Pergunta 1: "O local do extintor está correto conforme o mapa?" (Botões Conforme/Não Conforme).

Pergunta 2: "Os dados do extintor estão corretos?" (Botões Conforme/Não Conforme).

Ação: Ao salvar, enviar os dados para a tabela inspecoes e voltar para a grade principal (que deve atualizar a cor do botão imediatamente).

Tela 3: Histórico de Conferência
Lista cronológica das inspeções realizadas, mostrando quem fez e em qual data.