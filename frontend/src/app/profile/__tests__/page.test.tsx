import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "../page";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "../../../lib/api/users";
import { toast } from "sonner";

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../lib/api/users", () => ({
  updateProfile: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ProfilePage (Client component)", () => {
  const mockPush = jest.fn();
  const mockUpdateUserInSession = jest.fn();

  const mockUser = {
    id: "user-123",
    name: "Carlos Drummond",
    email: "carlos@drummond.com",
    role: "ADMIN",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("TC-01: redireciona para /login se o usuário não estiver autenticado", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      updateUserInSession: mockUpdateUserInSession,
    });

    render(<ProfilePage />);

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("TC-02: renderiza as informações iniciais do perfil do usuário logado", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    render(<ProfilePage />);

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    const emailInput = screen.getByLabelText("E-mail") as HTMLInputElement;

    expect(nameInput.value).toBe("Carlos Drummond");
    expect(emailInput.value).toBe("carlos@drummond.com");
    expect(emailInput).toBeDisabled();

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("TC-03: exibe erro de validação client-side se o nome for menor que 3 caracteres", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    render(<ProfilePage />);

    const nameInput = screen.getByLabelText("Nome");
    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });

    fireEvent.change(nameInput, { target: { value: "Ca" } });
    fireEvent.click(saveButton);

    expect(screen.getByText("O nome deve conter pelo menos 3 caracteres.")).toBeInTheDocument();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("TC-04: chama a API de atualização, propaga no contexto e exibe toast de sucesso ao salvar", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    const updatedUser = { ...mockUser, name: "Carlos Drummond de Andrade" };
    (updateProfile as jest.Mock).mockResolvedValue(updatedUser);

    render(<ProfilePage />);

    const nameInput = screen.getByLabelText("Nome");
    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });

    fireEvent.change(nameInput, { target: { value: "Carlos Drummond de Andrade" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith("user-123", "Carlos Drummond de Andrade", "mock-jwt-token");
      expect(mockUpdateUserInSession).toHaveBeenCalledWith(updatedUser);
      expect(toast.success).toHaveBeenCalledWith("Perfil atualizado com sucesso!");
    });
  });

  it("TC-05: exibe toast de erro se a requisição da API falhar", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    (updateProfile as jest.Mock).mockRejectedValue(new Error("Erro de autorização (403)"));

    render(<ProfilePage />);

    const nameInput = screen.getByLabelText("Nome");
    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });

    fireEvent.change(nameInput, { target: { value: "Carlos Drummond de Andrade" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
      expect(mockUpdateUserInSession).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Erro de autorização (403)");
    });
  });

  it("TC-06: cancela as alterações e restaura o nome original", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    render(<ProfilePage />);

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });

    fireEvent.change(nameInput, { target: { value: "Alteração Temporária" } });
    expect(nameInput.value).toBe("Alteração Temporária");

    fireEvent.click(cancelButton);

    expect(nameInput.value).toBe("Carlos Drummond");
  });
});
