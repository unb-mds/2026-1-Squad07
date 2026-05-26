import { apiRequest } from "@/lib/api/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
};

export function registerUser(name: string, email: string, password: string) {
  return apiRequest<AuthSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function loginUser(email: string, password: string) {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
