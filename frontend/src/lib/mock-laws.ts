import type { LawAnalysis, LawResult } from "@/types/law";

export const laws: LawResult[] = [
  {
    id: 1,
    title: "Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais",
    summary:
      "Dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou jurídica. A norma protege direitos fundamentais de liberdade, privacidade e livre desenvolvimento da personalidade.",
    score: 87,
    readability: 85,
    ambiguity: 90,
    technicalConformity: 82,
    year: 2018,
    category: "Proteção de Dados",
  },
  {
    id: 2,
    title: "Lei nº 8.078/1990 - Código de Defesa do Consumidor",
    summary:
      "Estabelece normas de proteção e defesa do consumidor, com regras para fornecedores, produtos, serviços e responsabilidade civil nas relações de consumo.",
    score: 92,
    readability: 90,
    ambiguity: 94,
    technicalConformity: 88,
    year: 1990,
    category: "Direito do Consumidor",
  },
  {
    id: 3,
    title: "Lei nº 12.965/2014 - Marco Civil da Internet",
    summary:
      "Define princípios, garantias, direitos e deveres para o uso da internet no Brasil, incluindo neutralidade de rede, privacidade e responsabilidade de provedores.",
    score: 78,
    readability: 75,
    ambiguity: 80,
    technicalConformity: 74,
    year: 2014,
    category: "Direito Digital",
  },
  {
    id: 4,
    title: "Lei nº 14.133/2021 - Nova Lei de Licitações",
    summary:
      "Regula licitações e contratos administrativos, consolidando modalidades, fases de disputa, critérios de julgamento e instrumentos de governança pública.",
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
  "Código de Defesa do Consumidor",
  "Marco Civil da Internet",
  "Lei de Licitações",
];

export const defaultAnalysis: LawAnalysis = {
  overallScore: 87,
  metrics: {
    readability: 85,
    ambiguity: 90,
    technicalConformity: 82,
  },
  legalText: `CAPÍTULO I - DISPOSIÇÕES PRELIMINARES

Art. 1º Esta Lei dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou por pessoa jurídica de direito público ou privado, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade.

Art. 2º A disciplina da proteção de dados pessoais tem como fundamentos o respeito à privacidade, a autodeterminação informativa, a liberdade de expressão e a inviolabilidade da intimidade.

Art. 3º Esta Lei aplica-se a qualquer operação de tratamento realizada por pessoa natural ou jurídica, independentemente do meio, do país de sua sede ou do país onde estejam localizados os dados.`,
  issues: [
    {
      type: "Ambiguidade Detectada",
      excerpt: "O disposto neste artigo aplica-se também aos casos em que...",
      issue:
        "A referência interna exige leitura cruzada e pode gerar interpretações distintas sem uma remissão mais precisa.",
    },
    {
      type: "Complexidade Sintática",
      excerpt: "Considera-se tratamento toda operação realizada com dados pessoais...",
      issue:
        "A frase concentra muitos conceitos técnicos em uma única definição, reduzindo a legibilidade para usuários não especialistas.",
    },
    {
      type: "Termo Técnico Não Definido",
      excerpt: "medidas técnicas e administrativas aptas a proteger os dados pessoais",
      issue:
        "A expressão poderia indicar critérios mínimos objetivos para reduzir discricionariedade na aplicação da norma.",
    },
  ],
  aiSummary:
    "A lei apresenta boa qualidade técnica geral, com organização clara e definições essenciais para a aplicação prática. A análise indica boa conformidade normativa, mas há trechos que podem se beneficiar de remissões mais objetivas e simplificação sintática.",
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
