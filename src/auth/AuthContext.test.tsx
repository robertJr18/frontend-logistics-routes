import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./useAuth";
import { authStorage } from "@/lib/authStorage";

function StatusProbe() {
  const { isAuthenticated, role, user } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="role">{role ?? "null"}</span>
      <span data-testid="email">{user?.email ?? "null"}</span>
    </div>
  );
}

const VALID_TOKEN_HEADER = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const validTokenWithExp = (expSecondsFromNow: number) => {
  const payload = {
    sub: "test@test.com",
    rol: "DISPATCHER",
    exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
    iat: Math.floor(Date.now() / 1000),
  };
  return `${VALID_TOKEN_HEADER}.${btoa(JSON.stringify(payload))}.fake-sig`;
};

beforeEach(() => {
  authStorage.clear();
});

afterEach(() => {
  authStorage.clear();
});

describe("AuthProvider — listener auth:unauthorized", () => {
  it("limpia user, role e isAuthenticated cuando se despacha el evento", () => {
    authStorage.setToken(validTokenWithExp(3600));
    authStorage.setUser({ email: "test@test.com", rol: "DISPATCHER" });

    render(
      <AuthProvider>
        <StatusProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth").textContent).toBe("yes");
    expect(screen.getByTestId("role").textContent).toBe("DISPATCHER");
    expect(screen.getByTestId("email").textContent).toBe("test@test.com");

    act(() => {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    });

    expect(screen.getByTestId("auth").textContent).toBe("no");
    expect(screen.getByTestId("role").textContent).toBe("null");
    expect(authStorage.getToken()).toBeNull();
    expect(authStorage.getUser()).toBeNull();
  });

  it("no hidrata sesión si el token está expirado", () => {
    authStorage.setToken(validTokenWithExp(-100));
    authStorage.setUser({ email: "test@test.com", rol: "DISPATCHER" });

    render(
      <AuthProvider>
        <StatusProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth").textContent).toBe("no");
    expect(authStorage.getToken()).toBeNull();
  });
});
