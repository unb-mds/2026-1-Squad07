import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renderiza um elemento input", () => {
    render(<Input />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renderiza com placeholder visível", () => {
    render(<Input placeholder="Digite seu e-mail" />);

    expect(
      screen.getByPlaceholderText("Digite seu e-mail"),
    ).toBeInTheDocument();
  });

  it("renderiza com type password sem expor o valor", () => {
    render(<Input type="password" />);

    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it("fica desabilitado quando a prop disabled é passada", () => {
    render(<Input disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("aplica className adicional", () => {
    render(<Input className="w-full" />);

    expect(screen.getByRole("textbox")).toHaveClass("w-full");
  });
});
