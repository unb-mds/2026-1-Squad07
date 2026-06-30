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
  createdAt: "2026-06-30T12:00:00Z",
  updatedAt: "2026-06-30T12:00:00Z",
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
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<LawDetailPage />);

    expect(
      await screen.findByText("Analisando qualidade legislativa do texto..."),
    ).toBeInTheDocument();
  });

  it("envia o payload esperado e renderiza score, métricas e alertas", async () => {
    mockJsonResponse(persistedLaw);
    mockJsonResponse({
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
    });

    render(<LawDetailPage />);

    expect(await screen.findByText("Boa qualidade legislativa")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("Ambiguidade")).toBeInTheDocument();
    expect(screen.getByText("18%")).toBeInTheDocument();
    expect(screen.getByText("Vagueza - 72%")).toBeInTheDocument();
    expect(screen.getByText("Trechos com termos pouco específicos.")).toBeInTheDocument();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/v1/analysis/evaluate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          lawId: "law-123",
          text: persistedLaw.text,
          type: "bill",
        }),
      }),
    );

    const analysisHeaders = mockFetch.mock.calls[1][1].headers as Headers;
    expect(analysisHeaders.get("Content-Type")).toBe("application/json");
  });

  it("exibe mensagem amigável quando a análise falha sem quebrar a exibição da lei", async () => {
    mockJsonResponse(persistedLaw);
    mockJsonResponse({}, 500);

    render(<LawDetailPage />);

    expect(
      await screen.findByText("Constituição Federal Exemplo"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Artigo primeiro de uma lei de teste para validação."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Análise de Qualidade Indisponível"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A solicitação não pôde ser concluída."),
    ).toBeInTheDocument();
  });
});
