import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renderiza o texto passado como filho", () => {
    render(<Badge>Documentação</Badge>);

    expect(screen.getByText("Documentação")).toBeInTheDocument();
  });

  it("renderiza como elemento span por padrão", () => {
    render(<Badge>Frontend</Badge>);

    expect(screen.getByText("Frontend").tagName).toBe("SPAN");
  });

  it("aplica className adicional", () => {
    render(<Badge className="minha-classe">Backend</Badge>);

    expect(screen.getByText("Backend")).toHaveClass("minha-classe");
  });

  it("renderiza variante secondary", () => {
    render(<Badge variant="secondary">Em andamento</Badge>);

    expect(screen.getByText("Em andamento")).toBeInTheDocument();
  });

  it("renderiza variante destructive", () => {
    render(<Badge variant="destructive">Bloqueado</Badge>);

    expect(screen.getByText("Bloqueado")).toBeInTheDocument();
  });

  it("renderiza como filho quando asChild é informado", () => {
    render(
      <Badge asChild>
        <a href="/status">Status</a>
      </Badge>
    );

    expect(screen.getByRole("link", { name: "Status" })).toHaveAttribute(
      "href",
      "/status",
    );
  });
});
