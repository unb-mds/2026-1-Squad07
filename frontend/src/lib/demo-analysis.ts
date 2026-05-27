export type DemoIssue = {
  type: string;
  excerpt: string;
  issue: string;
};

export type DemoAnalysis = {
  score: number;
  readability: number;
  ambiguity: number;
  technicalConformity: number;
  summary: string;
  issues: DemoIssue[];
};

export const demoDashboard = {
  averageScore: 67,
  analyzedLaws: "1.247",
  criticalLaws: "23",
};

export const demoAnalyses: Record<string, DemoAnalysis> = {
  "demo-mobilidade-urbana-2026": {
    score: 87,
    readability: 85,
    ambiguity: 90,
    technicalConformity: 82,
    summary:
      "A proposição apresenta objetivos claros e indicadores verificáveis. A redação pode detalhar responsabilidades de execução e critérios de priorização.",
    issues: [
      {
        type: "Critério de Priorização",
        excerpt: "priorização de corredores de transporte coletivo",
        issue: "O texto pode explicitar indicadores usados para ordenar os corredores atendidos.",
      },
    ],
  },
  "demo-transparencia-algoritmica-2026": {
    score: 92,
    readability: 90,
    ambiguity: 94,
    technicalConformity: 88,
    summary:
      "O texto delimita finalidade, transparência e revisão humana de forma objetiva, com boa compreensão para o cidadão.",
    issues: [
      {
        type: "Prazo Não Definido",
        excerpt: "mediante requerimento eletrônico gratuito",
        issue: "A revisão humana pode receber um prazo máximo para resposta.",
      },
    ],
  },
  "demo-merenda-escolar-2026": {
    score: 78,
    readability: 75,
    ambiguity: 80,
    technicalConformity: 74,
    summary:
      "A proposta organiza o objetivo social e a transparência das compras, mas pode esclarecer o alcance da prioridade regional.",
    issues: [
      {
        type: "Ambiguidade Detectada",
        excerpt: "agricultores familiares da região",
        issue: "O termo região pode ser definido para evitar interpretações diferentes na contratação.",
      },
    ],
  },
  "demo-dados-saude-2026": {
    score: 84,
    readability: 82,
    ambiguity: 83,
    technicalConformity: 87,
    summary:
      "Há boa proteção ao titular e descrição de controles essenciais; o prazo de comunicação de incidentes merece maior precisão.",
    issues: [
      {
        type: "Prazo Não Definido",
        excerpt: "em prazo compatível com a mitigação do risco",
        issue: "A expressão admite variação e poderia estabelecer prazo objetivo ou critérios mínimos.",
      },
    ],
  },
  "demo-residuos-eletronicos-2026": {
    score: 68,
    readability: 64,
    ambiguity: 70,
    technicalConformity: 72,
    summary:
      "O fluxo de coleta é compreensível, porém a implementação depende de obrigações e indicadores ainda pouco detalhados.",
    issues: [
      {
        type: "Responsabilidade Genérica",
        excerpt: "Municípios poderão instituir pontos públicos",
        issue: "O uso de poderão reduz a previsibilidade de implementação e cobertura.",
      },
    ],
  },
  "demo-acessibilidade-digital-2026": {
    score: 89,
    readability: 88,
    ambiguity: 91,
    technicalConformity: 86,
    summary:
      "A proposta é direta e orientada ao usuário, reunindo requisitos essenciais de navegação, conteúdo e canal de correção.",
    issues: [
      {
        type: "Referência Técnica",
        excerpt: "compatíveis com tecnologias assistivas",
        issue: "A norma pode referenciar padrões técnicos mínimos de acessibilidade digital.",
      },
    ],
  },
};

export function getDemoAnalysis(id: string) {
  return demoAnalyses[id];
}

export function scoreClass(score: number) {
  if (score >= 85) return "bg-green-50 text-green-700";
  if (score >= 70) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red-700";
}
