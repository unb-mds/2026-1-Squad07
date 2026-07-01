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

export type ReadabilityRequest = {
  lawId: string;
  text: string;
};

export type ReadabilityResponse = {
  score: number;
  classification: string;
  wordsCount: number;
  sentencesCount: number;
  averageSyllables: number;
};

export function submitLaw(submission: LawSubmission, token?: string | null) {
  return apiRequest<CreatedLaw>("/laws", {
    method: "POST",
    token,
    body: JSON.stringify(submission),
  });
}

export function listLawSubmissions() {
  return apiRequest<LawSubmissionListItem[]>("/laws");
}

export function getLaw(id: string) {
  return apiRequest<CreatedLaw>(`/laws/${encodeURIComponent(id)}`);
}

export async function getLawSummary(id: string) {
  const law = await getLaw(id);
  return law.summary ?? null;
}

export function analyzeLawReadability(payload: ReadabilityRequest) {
  return apiRequest<ReadabilityResponse>("/api/v1/laws/readability", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
