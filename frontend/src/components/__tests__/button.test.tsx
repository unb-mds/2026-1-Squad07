import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renderiza o texto passado como filho", () => {
    render(<Button>Enviar</Button>);

    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("renderiza como elemento button por padrão", () => {
    render(<Button>Clique aqui</Button>);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("aplica className adicional sem remover o padrão", () => {
    render(<Button className="minha-classe">Ação</Button>);

    expect(screen.getByRole("button")).toHaveClass("minha-classe");
  });

  it("fica desabilitado quando a prop disabled é passada", () => {
    render(<Button disabled>Salvar</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renderiza variante destructive", () => {
    render(<Button variant="destructive">Excluir</Button>);

    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("renderiza como filho quando asChild é informado", () => {
    render(
      <Button asChild>
        <a href="/leis">Abrir leis</a>
      </Button>
    );

    expect(screen.getByRole("link", { name: "Abrir leis" })).toHaveAttribute(
      "href",
      "/leis",
    );
  });
});
