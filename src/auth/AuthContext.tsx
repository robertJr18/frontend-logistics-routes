import { createContext, ReactNode, useEffect, useState } from "react";
import { authStorage } from "@/lib/authStorage";
import { decodeJwt, isExpired, login as loginRequest } from "@/services/auth";
import type { AuthUser, LoginRequest, Role } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (req: LoginRequest) => Promise<Role>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const token = authStorage.getToken();
    const storedUser = authStorage.getUser();
    if (!token || !storedUser) return;
    try {
      const claims = decodeJwt(token);
      if (isExpired(claims)) {
        authStorage.clear();
        return;
      }
      setUser(storedUser);
      setRole(storedUser.rol);
    } catch {
      authStorage.clear();
    }
  }, []);

  const login = async (req: LoginRequest): Promise<Role> => {
    const res = await loginRequest(req);
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    setUser(res.user);
    setRole(res.user.rol);
    return res.user.rol;
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
