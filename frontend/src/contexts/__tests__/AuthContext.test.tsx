import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import * as authApi from "../../lib/api/auth";

jest.mock("../../lib/api/auth", () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

type AuthSession = {
  accessToken: string;
  tokenType: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
};

function AuthConsumer() {
  const { user, token, login, register, logout } = useAuth();

  return (
    <div>
      <div data-testid="user">{user?.email ?? "null"}</div>
      <div data-testid="token">{token ?? "null"}</div>
      <button onClick={() => login("user@example.com", "password")}>login</button>
      <button onClick={() => register("Nome", "new@example.com", "password")}>register</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  const session: AuthSession = {
    accessToken: "token-123",
    tokenType: "Bearer",
    user: {
      id: "user-1",
      name: "Nome Usuario",
      email: "user@example.com",
      role: "user",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("throws if useAuth is rendered outside AuthProvider", () => {
    function BrokenConsumer() {
      useAuth();
      return null;
    }

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<BrokenConsumer />)).toThrow(
      "useAuth must be used within AuthProvider"
    );
    consoleErrorSpy.mockRestore();
  });

  it("restores session from localStorage", async () => {
    window.localStorage.setItem("crivoai_session", JSON.stringify(session));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("user@example.com");
      expect(screen.getByTestId("token")).toHaveTextContent("token-123");
    });
  });

  it("calls loginUser and saves session", async () => {
    (authApi.loginUser as jest.Mock).mockResolvedValue(session);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    await waitFor(() => {
      expect(authApi.loginUser).toHaveBeenCalledWith("user@example.com", "password");
      expect(screen.getByTestId("user")).toHaveTextContent("user@example.com");
      expect(window.localStorage.getItem("crivoai_session")).toContain("token-123");
    });
  });

  it("calls registerUser and saves session", async () => {
    (authApi.registerUser as jest.Mock).mockResolvedValue(session);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /register/i }));
    });

    await waitFor(() => {
      expect(authApi.registerUser).toHaveBeenCalledWith(
        "Nome",
        "new@example.com",
        "password"
      );
      expect(screen.getByTestId("user")).toHaveTextContent("user@example.com");
    });
  });

  it("clears session on logout", async () => {
    window.localStorage.setItem("crivoai_session", JSON.stringify(session));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("user@example.com");
    });

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
      expect(screen.getByTestId("token")).toHaveTextContent("null");
      expect(window.localStorage.getItem("crivoai_session")).toBeNull();
    });
  });
});
