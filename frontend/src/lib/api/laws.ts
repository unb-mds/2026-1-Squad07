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
