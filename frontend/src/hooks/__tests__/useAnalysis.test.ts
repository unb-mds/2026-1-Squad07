import { renderHook, act } from "@testing-library/react";
import { useAnalysis } from "../useAnalysis";

const mockFetch = jest.fn();

function mockJsonResponse(body: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("useAnalysis", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  // TDD-009: Happy path - fetch bem-sucedido
  test("should fetch warnings successfully and derive snippets", async () => {
    const apiResponse = {
      analysis_id: "uuid-12345",
      text: "Art. 1º. Fica instituído o regime especial de apoio ao desenvolvimento científico.",
      type: "bill",
      score: 0.85,
      cached: false,
      metrics: {
        ambiguidade: 0.92,
        vagueza: 0.2,
        falta_referencia: 0.1,
        inconsistencia: 0.1,
      },
      warnings: [
        {
          code: "ambiguidade",
          message: "Possível ambiguidade no regime especial",
          confidence: 0.92,
        },
      ],
    };

    mockJsonResponse(apiResponse);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.analyze(apiResponse.text, "bill");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).not.toBeNull();

    // Verifica que o snippet foi derivado corretamente a partir do texto
    const warning = result.current.data?.warnings[0];
    expect(warning?.code).toBe("ambiguidade");
    expect(warning?.snippet).toContain("regime especial");

    // Verifica se fetch foi chamado com payload correto
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/analysis/evaluate");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      text: apiResponse.text,
      type: "bill",
    });
  });

  // TDD-011: Erro 500
  test("should handle API error gracefully", async () => {
    mockJsonResponse({ detail: "Internal Server Error" }, 500);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.analyze("Artigo de lei", "bill");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Internal Server Error");
  });

  // TDD-012: Timeout ou falha de conexão
  test("should handle connection failure / timeout", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      await result.current.analyze("Artigo de lei", "bill");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toContain("Não foi possível conectar ao servidor");
  });

  // Adiciona teste passando lawId
  test("should include lawId in payload when provided", async () => {
    mockJsonResponse({
      analysis_id: "uuid-123",
      warnings: [],
      score: 1.0,
      metrics: {},
    });

    const { result } = renderHook(() => useAnalysis("law-123"));

    await act(async () => {
      await result.current.analyze("Artigo de lei", "bill");
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      text: "Artigo de lei",
      type: "bill",
      lawId: "law-123",
    });
  });
});
