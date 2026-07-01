import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfilePage from "../page";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getProfile, updateProfile } from "../../../lib/api/users";
import { toast } from "sonner";

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../../lib/api/users", () => ({
  updateProfile: jest.fn(),
  getProfile: jest.fn(),
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
    (getProfile as jest.Mock).mockResolvedValue(mockUser);
  });

  it("TC-01: redireciona para /login se o usuário não estiver autenticado", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      updateUserInSession: mockUpdateUserInSession,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("TC-02: renderiza as informações iniciais do perfil do usuário logado", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(getProfile).toHaveBeenCalled();
    });

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

    await waitFor(() => {
      expect(getProfile).toHaveBeenCalled();
    });

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

    // Aguarda a carga inicial assíncrona do getProfile terminar
    await waitFor(() => {
      expect(getProfile).toHaveBeenCalled();
    });

    const nameInput = screen.getByLabelText("Nome");
    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });

    // Limpa chamadas de renderização/busca inicial
    mockUpdateUserInSession.mockClear();

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

    // Aguarda a carga inicial assíncrona do getProfile terminar
    await waitFor(() => {
      expect(getProfile).toHaveBeenCalled();
    });

    const nameInput = screen.getByLabelText("Nome");
    const saveButton = screen.getByRole("button", { name: /Salvar Alterações/i });

    // Limpa chamadas de renderização/busca inicial
    mockUpdateUserInSession.mockClear();

    fireEvent.change(nameInput, { target: { value: "Carlos Drummond de Andrade" } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled();
      expect(mockUpdateUserInSession).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Erro de autorização (403)");
    });
  });

  it("TC-06: cancela as alterações e restaura o nome original", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(getProfile).toHaveBeenCalled();
    });

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });

    fireEvent.change(nameInput, { target: { value: "Alteração Temporária" } });
    expect(nameInput.value).toBe("Alteração Temporária");

    fireEvent.click(cancelButton);

    expect(nameInput.value).toBe("Carlos Drummond");
  });

  it("TC-07: sincroniza o nome do usuário quando ele é carregado assincronamente (null -> user carregado)", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      updateUserInSession: mockUpdateUserInSession,
    });

    const { rerender } = render(<ProfilePage />);

    expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    (getProfile as jest.Mock).mockResolvedValue(mockUser);

    rerender(<ProfilePage />);

    await waitFor(() => {
      const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
      expect(nameInput.value).toBe("Carlos Drummond");
    });
  });

  it("TC-08: dispara a requisição de busca de perfil na API ao carregar a página", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      token: "mock-jwt-token",
      updateUserInSession: mockUpdateUserInSession,
    });

    (getProfile as jest.Mock).mockResolvedValue(mockUser);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(getProfile).toHaveBeenCalledWith("user-123", "mock-jwt-token");
    });
  });
});
