export type LawResult = {
  id: number;
  title: string;
  summary: string;
  score: number;
  readability: number;
  ambiguity: number;
  technicalConformity: number;
  year: number;
  category: string;
};

export type IssueItem = {
  type: string;
  excerpt: string;
  issue: string;
};

export type LawAnalysis = {
  overallScore: number;
  metrics: {
    readability: number;
    ambiguity: number;
    technicalConformity: number;
  };
  legalText: string;
  issues: IssueItem[];
  aiSummary: string;
};
