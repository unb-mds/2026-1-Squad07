import { render, screen, waitFor } from "@testing-library/react";
import LawDetailPage from "./page";

const mockFetch = jest.fn();

const persistedLaw = {
  id: "law-123",
  title: "Constituição Federal Exemplo",
  description: null,
  text: "Artigo primeiro de uma lei de teste para validação.",
  sourceType: "text",
  sourceUrl: null,
  jurisdiction: null,
  lawNumber: "PL 123/2026",
  publicationDate: null,
  uploadedByUserId: null,
  isPublic: true,
  summary: null,
  createdAt: "2026-06-30T12:00:00Z",
  updatedAt: "2026-06-30T12:00:00Z",
};

const analysisResponse = {
  analysis_id: "analysis-123",
  status: "completed",
  score: 0.85,
  metrics: {
    ambiguidade: 0.18,
    vagueza: 0.32,
  },
  warnings: [
    {
      code: "vagueza",
      message: "Trechos com termos pouco específicos.",
      confidence: 0.72,
    },
  ],
  model_version: "legal-bert-pt@v0.1.0",
  cached: false,
};

function mockJsonResponse(body: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "law-123" }),
  useRouter: () => ({ back: jest.fn() }),
}));

describe("LawDetailPage - análise de qualidade", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("renderiza o estado de loading da análise de qualidade", async () => {
    mockJsonResponse(persistedLaw);
    mockJsonResponse(persistedLaw);
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<LawDetailPage />);

    expect(
      await screen.findByText("Analisando qualidade legislativa do texto..."),
    ).toBeInTheDocument();
  });

  it("envia o payload esperado e renderiza score, métricas e alertas", async () => {
    mockJsonResponse(persistedLaw);
    mockJsonResponse(persistedLaw);
    mockJsonResponse(analysisResponse);

    render(<LawDetailPage />);

    expect(await screen.findByText("Boa qualidade legislativa")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Ambiguidade")).toBeInTheDocument();
    expect(screen.getByText("18%")).toBeInTheDocument();
    expect(screen.getByText("Vagueza - 72%")).toBeInTheDocument();
    expect(screen.getByText("Trechos com termos pouco específicos.")).toBeInTheDocument();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));

    const analysisCall = mockFetch.mock.calls.find(
      ([url]) => url === "http://localhost:8000/api/v1/analysis/evaluate",
    );

    expect(analysisCall).toBeDefined();
    expect(analysisCall?.[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          lawId: "law-123",
          text: persistedLaw.text,
          type: "bill",
        }),
      }),
    );

    const analysisHeaders =
      analysisCall && analysisCall[1]
        ? (analysisCall[1].headers as Headers)
        : undefined;
    expect(analysisHeaders?.get("Content-Type")).toBe("application/json");
  });
});

describe("LawDetailPage - Resumo Explicativo por IA", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("RS-1: exibe loading local do resumo sem ocultar o texto da lei", async () => {
    mockJsonResponse(persistedLaw);
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    mockJsonResponse(analysisResponse);

    render(<LawDetailPage />);

    expect(await screen.findByText("Gerando resumo explicativo...")).toBeInTheDocument();
    expect(
      screen.getByText("Artigo primeiro de uma lei de teste para validação."),
    ).toBeInTheDocument();
  });

  it("RS-2: exibe com sucesso o resumo vindo do backend preservando as quebras de linha", async () => {
    const lawWithSummary = {
      ...persistedLaw,
      summary: "Parágrafo primeiro explicativo de IA.\nParágrafo segundo simplificado.",
    };

    mockJsonResponse(persistedLaw);
    mockJsonResponse(lawWithSummary);
    mockJsonResponse(analysisResponse);

    render(<LawDetailPage />);

    expect(await screen.findByText(/Parágrafo primeiro explicativo de IA./)).toBeInTheDocument();
    expect(screen.getByText(/Parágrafo segundo simplificado./)).toBeInTheDocument();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/laws/law-123",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  it("RS-3: exibe erro amigável quando a consulta do resumo falha", async () => {
    mockJsonResponse(persistedLaw);
    mockJsonResponse({}, 500);
    mockJsonResponse(analysisResponse);

    render(<LawDetailPage />);

    expect(await screen.findByText("Resumo indisponível no momento.")).toBeInTheDocument();
    expect(screen.getByText("A solicitação não pôde ser concluída.")).toBeInTheDocument();
    expect(
      screen.getByText("Artigo primeiro de uma lei de teste para validação."),
    ).toBeInTheDocument();
  });

  it("RS-4: trata amigavelmente o estado em que o resumo é nulo ou ausente", async () => {
    const lawWithoutSummary = {
      ...persistedLaw,
      summary: null,
    };

    mockJsonResponse(persistedLaw);
    mockJsonResponse(lawWithoutSummary);
    mockJsonResponse(analysisResponse);

    render(<LawDetailPage />);

    expect(await screen.findByText("Resumo Explicativo por IA")).toBeInTheDocument();
    expect(
      screen.getByText("Resumo indisponível ou ainda não processado para este documento legislativo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Constituição Federal Exemplo")).toBeInTheDocument();
  });
});
