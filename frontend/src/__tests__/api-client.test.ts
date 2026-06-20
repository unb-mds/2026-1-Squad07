import { ApiError, apiErrorMessage, apiRequest } from "@/lib/api/client";

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(body: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function mockNetworkError() {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("ApiError", () => {
  it("cria erro com mensagem e status corretos", () => {
    const error = new ApiError("Não autorizado.", 401);

    expect(error.message).toBe("Não autorizado.");
    expect(error.status).toBe(401);
    expect(error.name).toBe("ApiError");
  });

  it("é instância de Error", () => {
    const error = new ApiError("Erro interno.", 500);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("apiErrorMessage", () => {
  it("retorna a mensagem do ApiError quando o erro é ApiError", () => {
    const error = new ApiError("Email ou senha inválidos.", 401);

    expect(apiErrorMessage(error, "Erro desconhecido.")).toBe(
      "Email ou senha inválidos.",
    );
  });

  it("retorna o fallback quando o erro não é ApiError", () => {
    expect(apiErrorMessage(new Error("Genérico."), "Fallback.")).toBe(
      "Fallback.",
    );
  });

  it("retorna o fallback quando o erro é null", () => {
    expect(apiErrorMessage(null, "Fallback.")).toBe("Fallback.");
  });
});

describe("apiRequest", () => {
  it("retorna o corpo da resposta em caso de sucesso", async () => {
    mockResponse({ id: "1", title: "Lei teste" });

    const result = await apiRequest<{ id: string; title: string }>("/laws");

    expect(result).toEqual({ id: "1", title: "Lei teste" });
  });

  it("envia o header Authorization quando token é fornecido", async () => {
    mockResponse({ ok: true });

    await apiRequest("/laws", { token: "meu-token" });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.get("Authorization")).toBe("Bearer meu-token");
  });

  it("não envia Authorization quando token é null", async () => {
    mockResponse({ ok: true });

    await apiRequest("/laws", { token: null });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("define Content-Type como application/json quando há body", async () => {
    mockResponse({ ok: true });

    await apiRequest("/laws", {
      method: "POST",
      body: JSON.stringify({ title: "Lei" }),
    });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("lança ApiError com mensagem string do detail quando a resposta não é ok", async () => {
    mockResponse({ detail: "Não encontrado." }, 404);

    await expect(apiRequest("/laws/inexistente")).rejects.toThrow(
      new ApiError("Não encontrado.", 404),
    );
  });

  it("lança ApiError com mensagens concatenadas quando detail é array", async () => {
    mockResponse(
      { detail: [{ msg: "campo obrigatório" }, { msg: "formato inválido" }] },
      422,
    );

    await expect(apiRequest("/laws")).rejects.toThrow(
      new ApiError("campo obrigatório formato inválido", 422),
    );
  });

  it("lança ApiError com mensagem padrão quando a resposta de erro não tem detail", async () => {
    mockResponse({}, 500);

    await expect(apiRequest("/laws")).rejects.toThrow(
      new ApiError("A solicitação não pôde ser concluída.", 500),
    );
  });

  it("lança ApiError com status 0 quando ocorre erro de rede", async () => {
    mockNetworkError();

    await expect(apiRequest("/laws")).rejects.toThrow(
      new ApiError(
        "Não foi possível conectar ao servidor. Verifique se a API está disponível.",
        0,
      ),
    );
  });
});
