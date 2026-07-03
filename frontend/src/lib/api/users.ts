import { apiRequest } from "@/lib/api/client";
import { type AuthUser } from "./auth";

export function updateProfile(id: string, name: string, token: string) {
  return apiRequest<AuthUser>(`/users/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ name }),
  });
}

export function getProfile(id: string, token: string) {
  return apiRequest<AuthUser>(`/users/${id}`, {
    method: "GET",
    token,
  });
}
