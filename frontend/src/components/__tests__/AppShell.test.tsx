import { render, screen } from "@testing-library/react";
import { AppShell } from "../AppShell";
import { useAuth } from "../../contexts/AuthContext";

jest.mock("../../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("../ui/sonner", () => ({
  Toaster: () => null,
}));

describe("AppShell Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redireciona para /profile ao clicar no nome do usuário logado", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: "Carlos Drummond" },
      logout: jest.fn(),
    });

    render(<AppShell>conteudo</AppShell>);

    const profileLink = screen.getByRole("link", { name: /Carlos Drummond/i });
    expect(profileLink).toHaveAttribute("href", "/profile");
  });

  it("não renderiza o link de perfil quando não há usuário logado", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      logout: jest.fn(),
    });

    render(<AppShell>conteudo</AppShell>);

    expect(screen.queryByRole("link", { name: /Carlos Drummond/i })).not.toBeInTheDocument();
  });
});
