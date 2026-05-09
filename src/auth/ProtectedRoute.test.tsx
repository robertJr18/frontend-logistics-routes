import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthContext } from "./AuthContext";
import type { Role } from "@/types/auth";

function renderWithAuth(opts: { role: Role | null; initialPath: string; guardRoles?: Role[] }) {
  const ctxValue = {
    user: opts.role ? { email: "x@x.com", rol: opts.role } : null,
    role: opts.role,
    isAuthenticated: opts.role !== null,
    login: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={ctxValue}>
      <MemoryRouter initialEntries={[opts.initialPath]}>
        <Routes>
          <Route path="/login" element={<div>LOGIN_PAGE</div>} />
          <Route path="/admin" element={<div>ADMIN_PAGE</div>} />
          <Route path="/despachador" element={<div>DESPACHO_PAGE</div>} />
          <Route path="/conductor" element={<div>CONDUCTOR_PAGE</div>} />
          <Route element={<ProtectedRoute roles={opts.guardRoles} />}>
            <Route path="/protected" element={<div>PROTECTED_CONTENT</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("redirige a /login cuando no hay sesión", () => {
    renderWithAuth({ role: null, initialPath: "/protected" });
    expect(screen.getByText("LOGIN_PAGE")).toBeInTheDocument();
  });

  it("redirige al home del rol cuando el rol no matchea el guard", () => {
    renderWithAuth({ role: "DRIVER", initialPath: "/protected", guardRoles: ["FLEET_ADMIN"] });
    expect(screen.getByText("CONDUCTOR_PAGE")).toBeInTheDocument();
  });

  it("renderiza el children cuando el rol matchea", () => {
    renderWithAuth({ role: "FLEET_ADMIN", initialPath: "/protected", guardRoles: ["FLEET_ADMIN"] });
    expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
  });

  it("renderiza el children cuando no hay restricción de roles y hay sesión", () => {
    renderWithAuth({ role: "DISPATCHER", initialPath: "/protected" });
    expect(screen.getByText("PROTECTED_CONTENT")).toBeInTheDocument();
  });
});
