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

describe("LawDetailPage - score de legibilidade", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("renderiza o estado de loading da análise de legibilidade", async () => {
    mockJsonResponse(persistedLaw);
    mockFetch.mockReturnValueOnce(new Promise(() => {}));
    mockJsonResponse({ warnings: [] });

    render(<LawDetailPage />);

    expect(
      await screen.findByText("Analisando legibilidade do texto..."),
    ).toBeInTheDocument();
  });

  it("envia o payload esperado e renderiza score, classificação e métricas detalhadas", async () => {
    mockJsonResponse(persistedLaw);
    mockJsonResponse({
      score: 85,
      classification: "Fácil leitura",
      wordsCount: 140,
      sentencesCount: 12,
      averageSyllables: 2.4,
    });
    mockJsonResponse({
      analysis_id: "uuid-999",
      score: 0.9,
      warnings: [],
    });

    render(<LawDetailPage />);

    expect(await screen.findByText("Fácil leitura")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("140")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2.4")).toBeInTheDocument();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/v1/laws/readability",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          lawId: "law-123",
          text: persistedLaw.text,
        }),
      }),
    );

    expect(mockFetch).toHaveBeenNthCalledWith(
      3,
      "http://localhost:8000/api/v1/analysis/evaluate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          text: persistedLaw.text,
          type: "bill",
          lawId: "law-123",
        }),
      }),
    );

    const readabilityHeaders = mockFetch.mock.calls[1][1].headers as Headers;
    expect(readabilityHeaders.get("Content-Type")).toBe("application/json");
  });

  it("exibe mensagem amigável quando a análise falha sem quebrar a exibição da lei", async () => {
    mockJsonResponse(persistedLaw);
    mockJsonResponse({}, 500);
    mockJsonResponse({ detail: "Análise falhou" }, 500);

    render(<LawDetailPage />);

    expect(
      await screen.findByText("Constituição Federal Exemplo"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Artigo primeiro de uma lei de teste para validação."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Análise de Legibilidade Indisponível"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A solicitação não pôde ser concluída."),
    ).toBeInTheDocument();
  });
});
