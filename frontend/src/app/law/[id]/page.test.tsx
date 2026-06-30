import { render, screen, waitFor } from "@testing-library/react";
import LawDetailPage from "./page";
import { getLaw } from "@/lib/api/laws";

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "law-123" }),
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock("@/lib/api/laws", () => ({
  getLaw: jest.fn(),
}));

describe("LawDetailPage - Issue #136 Front-end Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getLaw as jest.Mock).mockResolvedValue({
      id: "law-123",
      title: "Constituição Federal Exemplo",
      text: "Artigo primeiro de uma lei de teste para validação.",
      createdAt: "2026-06-30T12:00:00Z",
    });
  });

  it("deve renderizar o estado de loading da análise de legibilidade", async () => {
    global.fetch = jest.fn(() => new Promise(() => {}));

    render(<LawDetailPage />);

    expect(await screen.findByText(/Analisando legibilidade do texto.../i)).toBeInTheDocument();
  });

  it("deve renderizar sucesso com score, classificação e métricas baseadas no payload", async () => {
    const mockResponse = {
      score: 85,
      classification: "Fácil Leitura",
      wordsCount: 140,
      sentencesCount: 12,
      averageSyllables: 2.4,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(<LawDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("85")).toBeInTheDocument();
      expect(screen.getByText("Fácil Leitura")).toBeInTheDocument();
      expect(screen.getByText("140")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/laws/readability"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ lawId: "law-123", text: "Artigo primeiro de uma lei de teste para validação." }),
      })
    );
  });

  it("deve exibir mensagem amigável em caso de erro da API sem quebrar o componente", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    render(<LawDetailPage />);

    expect(await screen.findByText("Constituição Federal Exemplo")).toBeInTheDocument();
    expect(await screen.findByText(/Análise de Legibilidade Indisponível/i)).toBeInTheDocument();
  });
});