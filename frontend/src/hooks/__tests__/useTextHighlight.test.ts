import { renderHook, act } from "@testing-library/react";
import { useTextHighlight } from "../useTextHighlight";

describe("useTextHighlight", () => {
  let container: HTMLDivElement;

  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  const mockScrollIntoView = jest.fn();

  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    mockScrollIntoView.mockReset();

    // Configura o elemento no DOM antes de cada teste
    container = document.createElement("div");
    container.setAttribute("id", "law-content");
    container.innerHTML = "Art. 1º. Esta lei estabelece o regime especial de apoio.";
    document.body.appendChild(container);
  });

  afterEach(() => {
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    // Limpa o DOM
    document.body.removeChild(container);
  });

  // TDD-005: Happy path - hook retorna funções
  test("should return highlight and clear functions", () => {
    const { result } = renderHook(() => useTextHighlight());
    expect(result.current.highlightText).toBeInstanceOf(Function);
    expect(result.current.clearHighlight).toBeInstanceOf(Function);
    expect(result.current.isHighlighted).toBe(false);
  });

  // TDD-006: Buscar e encontrar texto
  test("should find and highlight text in DOM", () => {
    const { result } = renderHook(() => useTextHighlight());

    let success = false;
    act(() => {
      success = result.current.highlightText("regime especial", "law-content");
    });

    expect(success).toBe(true);
    expect(result.current.isHighlighted).toBe(true);
    expect(mockScrollIntoView).toHaveBeenCalled();

    const markElement = container.querySelector("mark.highlight");
    expect(markElement).toBeInTheDocument();
    expect(markElement?.textContent).toBe("regime especial");
  });

  // TDD-007: Limpar highlight
  test("should clear highlight after calling clearHighlight", () => {
    const { result } = renderHook(() => useTextHighlight());

    act(() => {
      result.current.highlightText("regime especial", "law-content");
    });

    expect(container.querySelector("mark.highlight")).toBeInTheDocument();
    expect(result.current.isHighlighted).toBe(true);

    act(() => {
      result.current.clearHighlight();
    });

    expect(container.querySelector("mark.highlight")).not.toBeInTheDocument();
    expect(result.current.isHighlighted).toBe(false);
    expect(container.textContent).toBe("Art. 1º. Esta lei estabelece o regime especial de apoio.");
  });

  // Teste adicional: texto não encontrado
  test("should return false if text is not found", () => {
    const { result } = renderHook(() => useTextHighlight());

    let success = true;
    act(() => {
      success = result.current.highlightText("inexistente", "law-content");
    });

    expect(success).toBe(false);
    expect(result.current.isHighlighted).toBe(false);
    expect(container.querySelector("mark.highlight")).not.toBeInTheDocument();
  });
});
