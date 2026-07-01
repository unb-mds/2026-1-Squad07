import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { WarningsSidebar } from "../WarningsSidebar";
import { useTextHighlight } from "@/hooks/useTextHighlight";
import type { Warning } from "@/types/analysis";

// Componente wrapper para testar a integração do Sidebar com o Hook de Highlight
const IntegrationTestWrapper: React.FC<{ warnings: Warning[]; text: string }> = ({ warnings, text }) => {
  const { highlightText, clearHighlight } = useTextHighlight();

  const handleWarningClick = (warning: Warning) => {
    highlightText(warning.snippet, "law-content");
  };

  return (
    <div className="flex gap-4">
      <div id="law-content" className="law-content">
        {text}
      </div>
      <WarningsSidebar
        warnings={warnings}
        textContent={text}
        isLoading={false}
        error={null}
        onWarningClick={handleWarningClick}
      />
    </div>
  );
};

describe("WarningsSidebar Integration", () => {
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  const mockScrollIntoView = jest.fn();

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollIntoView.mockReset();
  });

  afterEach(() => {
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });

  // TDD-010: Clique em card dispara scroll + highlight
  test("should scroll and highlight text when card is clicked", async () => {
    const textContent = "Art. 1º. Esta lei estabelece o regime especial de apoio ao desenvolvimento científico.";
    const warnings: Warning[] = [
      {
        code: "ambiguidade",
        message: "Possível ambiguidade",
        snippet: "regime especial",
        confidence: 0.9,
      },
    ];

    render(<IntegrationTestWrapper warnings={warnings} text={textContent} />);

    // Verifica que o texto está renderizado normalmente
    const container = document.getElementById("law-content");
    expect(container).toBeInTheDocument();
    expect(container?.querySelector("mark.highlight")).not.toBeInTheDocument();

    // Clica no card
    const card = screen.getByRole("button");
    act(() => {
      fireEvent.click(card);
    });

    // 1. Verifica se a marcação de highlight foi inserida no DOM
    const markElement = container?.querySelector("mark.highlight");
    expect(markElement).toBeInTheDocument();
    expect(markElement?.textContent).toBe("regime especial");

    // 2. Verifica se a função de scroll foi disparada
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
  });
});
