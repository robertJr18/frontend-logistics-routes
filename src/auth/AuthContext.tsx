import { createContext, ReactNode, useEffect, useState } from "react";
import { authStorage } from "@/lib/authStorage";
import { decodeJwt, isExpired, login as loginRequest, parseRole } from "@/services/auth";
import type { AuthUser, LoginRequest, Role } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<Role>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): { user: AuthUser | null; role: Role | null } {
  const token = authStorage.getToken();
  const storedUser = authStorage.getUser();
  if (!token || !storedUser) return { user: null, role: null };
  try {
    if (isExpired(decodeJwt(token))) {
      authStorage.clear();
      return { user: null, role: null };
    }
    return { user: storedUser, role: storedUser.rol };
  } catch {
    authStorage.clear();
    return { user: null, role: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: corre sincrónicamente antes del primer render,
  // evitando que ProtectedRoute redirija a /login en el reload.
  const [user, setUser] = useState<AuthUser | null>(() => readStoredAuth().user);
  const [role, setRole] = useState<Role | null>(() => readStoredAuth().role);

  useEffect(() => {
    const handler = () => {
      authStorage.clear();
      setUser(null);
      setRole(null);
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  const login = async (req: LoginRequest): Promise<Role> => {
    const res = await loginRequest(req);
    const role = parseRole(res.rol);
    if (!role) {
      throw new Error(`Rol desconocido recibido del backend: ${res.rol}`);
    }
    const userObj: AuthUser = { email: req.email, rol: role };
    authStorage.setToken(res.token);
    authStorage.setUser(userObj);
    setUser(userObj);
    setRole(role);
    return role;
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: role !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
