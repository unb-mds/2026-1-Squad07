const DEFAULT_API_URL = "http://localhost:8000";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL
).replace(/\/$/, "");

type ApiErrorPayload = {
  detail?: string | { msg?: string }[];
};

type ApiRequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractErrorMessage(payload: ApiErrorPayload | null) {
  if (!payload?.detail) {
    return null;
  }

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  return payload.detail.map((item) => item.msg).filter(Boolean).join(" ");
}

export async function apiRequest<T>(
  path: string,
  { token, headers, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);

  if (options.body && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se a API está disponível.",
      0,
    );
  }

  if (!response.ok) {
    let payload: ApiErrorPayload | null = null;

    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      // Uma resposta sem JSON ainda deve produzir erro HTTP utilizável.
    }

    throw new ApiError(
      extractErrorMessage(payload) ?? "A solicitação não pôde ser concluída.",
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function apiErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}
