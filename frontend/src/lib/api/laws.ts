import { apiRequest } from "@/lib/api/client";

export type LawSubmission = {
  title: string;
  text: string;
  lawNumber: string;
  publicationDate?: string;
};

export type CreatedLaw = {
  id: string;
  title: string;
  description: string | null;
  text: string;
  summary?: string | null;
  sourceType: string;
  sourceUrl: string | null;
  jurisdiction: string | null;
  lawNumber: string | null;
  publicationDate: string | null;
  uploadedByUserId: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LawSubmissionListItem = {
  id: string;
  title: string;
  createdAt: string;
  textExcerpt: string;
};

export type AnalysisRequest = {
  lawId?: string;
  text: string;
  type: "bill" | "amendment";
};

export type AnalysisWarning = {
  code: string;
  message: string;
  confidence: number;
};

export type AnalysisResponse = {
  analysis_id: string;
  status: "pending" | "completed" | "failed";
  score: number | null;
  metrics: Record<string, number>;
  warnings: AnalysisWarning[];
  model_version: string;
  cached: boolean;
};

export function submitLaw(submission: LawSubmission, token?: string | null) {
  return apiRequest<CreatedLaw>("/laws", {
    method: "POST",
    token,
    body: JSON.stringify(submission),
  });
}

export function listLawSubmissions(sourceType: string = "USER_UPLOAD") {
  return apiRequest<LawSubmissionListItem[]>(
    `/laws?source_type=${encodeURIComponent(sourceType)}`,
  );
}

export function getLaw(id: string) {
  return apiRequest<CreatedLaw>(`/laws/${encodeURIComponent(id)}`);
}

export async function getLawSummary(id: string) {
  const law = await getLaw(id);
  return law.summary ?? null;
}

export function analyzeLawQuality(payload: AnalysisRequest) {
  return apiRequest<AnalysisResponse>("/api/v1/analysis/evaluate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
