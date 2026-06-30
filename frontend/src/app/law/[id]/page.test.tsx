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

    render(<LawDetailPage />);

    expect(await screen.findByText("Fácil leitura")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("140")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2.4")).toBeInTheDocument();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });
});

describe("LawDetailPage - Resumo Explicativo por IA", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
  });

  it("RS-2: exibe com sucesso o resumo vindo do backend preservando as quebras de linha", async () => {
    const lawWithSummary = {
      ...persistedLaw,
      summary: "Parágrafo primeiro explicativo de IA.\nParágrafo segundo simplificado.",
    };

    mockJsonResponse(lawWithSummary);
    mockJsonResponse({
      score: 75,
      classification: "Leitura Padrão",
      wordsCount: 100,
      sentencesCount: 8,
      averageSyllables: 2.1,
    });

    render(<LawDetailPage />);

    expect(await screen.findByText("Resumo Explicativo por IA")).toBeInTheDocument();
    expect(screen.getByText(/Parágrafo primeiro explicativo de IA./)).toBeInTheDocument();
    expect(screen.getByText(/Parágrafo segundo simplificado./)).toBeInTheDocument();
  });

  it("RS-4: trata amigavelmente o estado em que o resumo é nulo ou ausente", async () => {
    const lawWithoutSummary = {
      ...persistedLaw,
      summary: null,
    };

    mockJsonResponse(lawWithoutSummary);
    mockJsonResponse({}, 500);

    render(<LawDetailPage />);

    expect(await screen.findByText("Resumo Explicativo por IA")).toBeInTheDocument();
    expect(
      screen.getByText("Resumo indisponível ou ainda não processado para este documento legislativo."),
    ).toBeInTheDocument();
    
    expect(screen.getByText("Constituição Federal Exemplo")).toBeInTheDocument();
  });
});