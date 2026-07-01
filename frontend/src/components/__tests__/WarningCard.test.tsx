import { render, screen, fireEvent } from "@testing-library/react";
import { WarningCard } from "../WarningCard";
import type { Warning } from "@/types/analysis";

describe("WarningCard", () => {
  const mockWarning: Warning = {
    code: "ambiguidade",
    message: "Termo 'regime especial' não é definido no artigo.",
    snippet: "Art. 1º estabelece o regime especial...",
    confidence: 0.92,
  };

  // TDD-001: Renderização básica
  test("should render warning card with all fields", () => {
    const onSelect = jest.fn();
    render(<WarningCard warning={mockWarning} onSelect={onSelect} />);

    expect(screen.getByText("Ambiguidade")).toBeInTheDocument();
    expect(screen.getByText("Termo 'regime especial' não é definido no artigo.")).toBeInTheDocument();
    expect(screen.getByText(/Art. 1º estabelece o regime especial/)).toBeInTheDocument();
    expect(screen.getByText("92%")).toBeInTheDocument();
  });

  // Clique dispara callback
  test("should call onSelect when clicked", () => {
    const onSelect = jest.fn();
    render(<WarningCard warning={mockWarning} onSelect={onSelect} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(mockWarning);
  });

  // TDD-002: Dados malformados / campos vazios
  test("should render safely with incomplete warning fields", () => {
    const incomplete: Warning = {
      code: "vagueza",
      message: "",
      snippet: "",
      confidence: 0,
    };
    
    const { container } = render(<WarningCard warning={incomplete} onSelect={jest.fn()} />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText("Vagueza")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
