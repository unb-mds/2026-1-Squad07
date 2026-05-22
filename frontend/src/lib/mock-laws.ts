import type { LawAnalysis, LawResult } from "@/types/law";

export const laws: LawResult[] = [
  {
    id: 1,
    title: "Lei n. 13.709/2018 - Lei Geral de Protecao de Dados Pessoais",
    summary:
      "Dispoe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou juridica. A norma protege direitos fundamentais de liberdade, privacidade e livre desenvolvimento da personalidade.",
    score: 87,
    readability: 85,
    ambiguity: 90,
    technicalConformity: 82,
    year: 2018,
    category: "Protecao de Dados",
  },
  {
    id: 2,
    title: "Lei n. 8.078/1990 - Codigo de Defesa do Consumidor",
    summary:
      "Estabelece normas de protecao e defesa do consumidor, com regras para fornecedores, produtos, servicos e responsabilidade civil nas relacoes de consumo.",
    score: 92,
    readability: 90,
    ambiguity: 94,
    technicalConformity: 88,
    year: 1990,
    category: "Direito do Consumidor",
  },
  {
    id: 3,
    title: "Lei n. 12.965/2014 - Marco Civil da Internet",
    summary:
      "Define principios, garantias, direitos e deveres para o uso da internet no Brasil, incluindo neutralidade de rede, privacidade e responsabilidade de provedores.",
    score: 78,
    readability: 75,
    ambiguity: 80,
    technicalConformity: 74,
    year: 2014,
    category: "Direito Digital",
  },
  {
    id: 4,
    title: "Lei n. 14.133/2021 - Nova Lei de Licitacoes",
    summary:
      "Regula licitacoes e contratos administrativos, consolidando modalidades, fases de disputa, criterios de julgamento e instrumentos de governanca publica.",
    score: 68,
    readability: 64,
    ambiguity: 70,
    technicalConformity: 72,
    year: 2021,
    category: "Administrativo",
  },
];

export const quickSearches = [
  "Lei 13.709/2018",
  "Codigo de Defesa do Consumidor",
  "Marco Civil da Internet",
  "Lei de Licitacoes",
];

export const defaultAnalysis: LawAnalysis = {
  overallScore: 87,
  metrics: {
    readability: 85,
    ambiguity: 90,
    technicalConformity: 82,
  },
  legalText: `CAPITULO I - DISPOSICOES PRELIMINARES

Art. 1. Esta Lei dispoe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou por pessoa juridica de direito publico ou privado, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade.

Art. 2. A disciplina da protecao de dados pessoais tem como fundamentos o respeito a privacidade, a autodeterminacao informativa, a liberdade de expressao e a inviolabilidade da intimidade.

Art. 3. Esta Lei aplica-se a qualquer operacao de tratamento realizada por pessoa natural ou juridica, independentemente do meio, do pais de sua sede ou do pais onde estejam localizados os dados.`,
  issues: [
    {
      type: "Ambiguidade Detectada",
      excerpt: "O disposto neste artigo aplica-se tambem aos casos em que...",
      issue:
        "A referencia interna exige leitura cruzada e pode gerar interpretacoes distintas sem uma remissao mais precisa.",
    },
    {
      type: "Complexidade Sintatica",
      excerpt: "Considera-se tratamento toda operacao realizada com dados pessoais...",
      issue:
        "A frase concentra muitos conceitos tecnicos em uma unica definicao, reduzindo a legibilidade para usuarios nao especialistas.",
    },
    {
      type: "Termo Tecnico Nao Definido",
      excerpt: "medidas tecnicas e administrativas aptas a proteger os dados pessoais",
      issue:
        "A expressao poderia indicar criterios minimos objetivos para reduzir discricionariedade na aplicacao da norma.",
    },
  ],
  aiSummary:
    "A lei apresenta boa qualidade tecnica geral, com organizacao clara e definicoes essenciais para a aplicacao pratica. A analise indica boa conformidade normativa, mas ha trechos que podem se beneficiar de remissoes mais objetivas e simplificacao sintatica.",
};

export function searchMockLaws(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return laws;
  }

  const terms = normalized.split(/\s+/).filter(Boolean);
  const filtered = laws.filter((law) => {
    const text = `${law.title} ${law.summary} ${law.category}`.toLowerCase();
    return terms.some((term) => text.includes(term.replace(/[^\w]/g, "")) || text.includes(term));
  });

  return filtered.length > 0 ? filtered : laws;
}

export function getLawById(id: string | number) {
  return laws.find((law) => law.id === Number(id)) ?? laws[0];
}
