import { render, screen } from "@testing-library/react";
import { WarningsSidebar } from "../WarningsSidebar";
import type { Warning } from "@/types/analysis";

describe("WarningsSidebar", () => {
  const mockWarnings: Warning[] = [
    {
      code: "ambiguidade",
      message: "Termo não definido",
      snippet: "regime especial",
      confidence: 0.92,
    },
    {
      code: "vagueza",
      message: "Dispositivo vago",
      snippet: "a critério",
      confidence: 0.75,
    },
  ];

  // TDD-001: Renderização de múltiplos cards
  test("should render multiple warning cards", () => {
    const onWarningClick = jest.fn();
    render(
      <WarningsSidebar
        warnings={mockWarnings}
        isLoading={false}
        error={null}
        textContent="Art. 1º estabelece o regime especial a critério."
        onWarningClick={onWarningClick}
      />
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getByText("Ambiguidade")).toBeInTheDocument();
    expect(screen.getByText("Vagueza")).toBeInTheDocument();
  });

  // TDD-003: Estado vazio
  test("should show empty state message when no warnings", () => {
    render(
      <WarningsSidebar
        warnings={[]}
        isLoading={false}
        error={null}
        textContent="Texto de lei perfeito."
        onWarningClick={jest.fn()}
      />
    );

    expect(screen.getByText("Nenhum problema identificado")).toBeInTheDocument();
    expect(screen.getByText("O texto legislativo está em conformidade com as diretrizes de qualidade.")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  // TDD-004: Loading state
  test("should show loading spinner while loading", () => {
    render(
      <WarningsSidebar
        warnings={[]}
        isLoading={true}
        error={null}
        textContent="Texto."
        onWarningClick={jest.fn()}
      />
    );

    expect(screen.getByText(/Analisando texto legislativo.../i)).toBeInTheDocument();
    expect(screen.queryByText("Nenhum problema identificado")).not.toBeInTheDocument();
  });

  // Error state
  test("should show error message on API error", () => {
    render(
      <WarningsSidebar
        warnings={[]}
        isLoading={false}
        error="Erro ao carregar análise"
        textContent="Texto."
        onWarningClick={jest.fn()}
      />
    );

    expect(screen.getByText("Erro ao carregar análise")).toBeInTheDocument();
    expect(screen.queryByText("Nenhum problema identificado")).not.toBeInTheDocument();
  });
});
