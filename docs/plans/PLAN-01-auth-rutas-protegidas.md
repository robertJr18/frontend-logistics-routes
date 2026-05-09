# PLAN-01 — Auth y Rutas Protegidas

**Date:** 2026-05-05
**Sprint:** 1 (depende de PLAN-00)
**Backend pareado:** `POST /api/auth/login` con Spring Security + JWT (T015–T016 del PLAN-00 backend). Roles: `ROLE_FLEET_ADMIN`, `ROLE_DISPATCHER`, `ROLE_DRIVER`.

---

## Summary

Reemplazar el login mock ([LoginPage.tsx:14-19](../../src/pages/auth/LoginPage.tsx#L14-L19)) por autenticación real contra el endpoint JWT del backend, agregar gestión de sesión vía `AuthContext`, proteger las rutas por rol y convertir `/portal` en un redirector que envía al panel correspondiente al rol del token. Sin esto, ningún plan posterior (PLAN-02..05) puede llamar endpoints protegidos del backend.

**Este plan NO toca pantallas de despachador / conductor / admin más allá de envolverlas en `ProtectedRoute`.** Las pantallas siguen leyendo `mockData.ts` hasta PLAN-03+.

---

## Decisiones

### 1. Almacenamiento del token en localStorage

**Decisión:** guardar el JWT en `localStorage` bajo `auth.token` y el `user` bajo `auth.user`.

**Tradeoff:** localStorage es vulnerable a XSS pero no a CSRF (al revés que cookies). Para este proyecto el riesgo es bajo y la simplicidad gana. Si producción exige hardening, se evalúa httpOnly cookie + endpoint refresh — fuera de alcance acá.

### 2. AuthContext nativo de React

**Decisión:** un `AuthContext` con hook `useAuth()`. Sin Redux, Zustand ni librería externa. El estado es `{ user, role, isAuthenticated, login(), logout() }`.

**Por qué:** auth es cross-cutting (lo necesitan AppRoutes, ProtectedRoute, LoginPage, Navbar). Context es la herramienta nativa para esto y el equipo ya lo conoce.

### 3. Decodificación del JWT con `jwt-decode`

**Decisión:** instalar `jwt-decode` — única dependencia de runtime nueva en este sprint. Decodifica el payload para extraer `roles[]`, `sub`, `exp`.

### 4. Rol único por usuario

**Decisión:** cada usuario tiene exactamente un rol (`FLEET_ADMIN` | `DISPATCHER` | `DRIVER`). El backend no asigna múltiples roles a un mismo usuario en este proyecto.

**Por qué:** simplifica la lógica de redirección. `ProtectedRoute` toma `roles?: Role[]` por flexibilidad pero en la práctica cada usuario matchea solo uno.

### 5. Sin refresh token (por ahora)

**Decisión:** cuando el JWT expire, la siguiente llamada al backend retorna 401 → logout automático → redirect a `/login`. El interceptor que detecta el 401 vive en PLAN-02; mientras tanto, este plan implementa el chequeo de `exp` al hidratar desde localStorage (token vencido al cargar → no se restaura sesión).

### 6. `/portal` se convierte en redirector

**Decisión:** la pantalla actual de selección manual de rol ([PortalPage.tsx](../../src/pages/public/PortalPage.tsx)) deja de tener sentido con auth real (el rol viene del token). Se convierte en una ruta protegida que hace `<Navigate>` al home del rol.

**Por qué no eliminarla:** [Navbar.tsx:10](../../src/components/Navbar.tsx#L10) usa `backTo = "/portal"` como default. Mantener la ruta como redirector preserva los links sin romper nada y el día que se quiera limpiar, se hace en un PR aparte.

### 7. Contrato del endpoint — asumido y a verificar (T101)

**Asumido:**

```
POST /api/auth/login
Request:
  { "email": "string", "password": "string" }
Response 200:
  {
    "token": "eyJ...",
    "tokenType": "Bearer",
    "user": {
      "id": "UUID",
      "email": "string",
      "nombre": "string",
      "rol": "FLEET_ADMIN" | "DISPATCHER" | "DRIVER"
    }
  }
Response 401: credenciales inválidas

JWT payload:
  {
    "sub": "<email>",
    "roles": ["ROLE_FLEET_ADMIN" | "ROLE_DISPATCHER" | "ROLE_DRIVER"],
    "exp": <unix ts>,
    "iat": <unix ts>
  }
```

T101 verifica esto contra el backend real con `curl`. Si difiere (p.ej. `username` en vez de `email`, claim `authorities` en vez de `roles`, sin prefijo `ROLE_`), se ajustan los tipos en [src/types/auth.ts](../../src/types/auth.ts) y los mappers en [src/services/auth.ts](../../src/services/auth.ts). El resto del plan no cambia.

---

## Estado actual (delta a aplicar)

| Archivo                                                           | Estado                                  | Acción                                                                          |
| ----------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| [LoginPage.tsx:14-19](../../src/pages/auth/LoginPage.tsx#L14-L19) | `setTimeout` mock → navigate("/portal") | Llamar `login()` del AuthContext, redirigir al home del rol                     |
| [PortalPage.tsx](../../src/pages/public/PortalPage.tsx)           | Selector visual de 3 roles              | Reemplazar por `<Navigate>` a home del rol                                      |
| [AppRoutes.tsx](../../src/routes/AppRoutes.tsx)                   | Rutas sin protección                    | Envolver `/admin`, `/despachador`, `/conductor`, `/portal` con `ProtectedRoute` |
| [App.tsx](../../src/App.tsx)                                      | Sin AuthProvider                        | Envolver `<AppRoutes />` con `<AuthProvider>` dentro de `<BrowserRouter>`       |
| [Navbar.tsx:22](../../src/components/Navbar.tsx#L22)              | `onClick={() => navigate("/")}` (Salir) | Llamar `useAuth().logout()` antes del navigate                                  |
| `src/types/auth.ts`                                               | No existe                               | Crear                                                                           |
| `src/lib/authStorage.ts`                                          | No existe                               | Crear (wrapper localStorage)                                                    |
| `src/services/auth.ts`                                            | No existe                               | Crear (login + decode + roleFromClaims)                                         |
| `src/auth/AuthContext.tsx`                                        | No existe                               | Crear                                                                           |
| `src/auth/useAuth.ts`                                             | No existe                               | Crear                                                                           |
| `src/auth/ProtectedRoute.tsx`                                     | No existe                               | Crear                                                                           |
| `src/auth/constants.ts`                                           | No existe                               | Crear (`HOME_BY_ROLE`)                                                          |
| `package.json`                                                    | Sin `jwt-decode`                        | Agregar                                                                         |

---

## Estructura de archivos nuevos

```
src/
├── types/
│   └── auth.ts                   [NUEVO]
├── lib/
│   └── authStorage.ts            [NUEVO]
├── services/
│   ├── api.ts                    (existente, no se modifica acá — el interceptor de Authorization vive en PLAN-02)
│   └── auth.ts                   [NUEVO]
├── auth/
│   ├── AuthContext.tsx           [NUEVO]
│   ├── useAuth.ts                [NUEVO]
│   ├── ProtectedRoute.tsx        [NUEVO]
│   └── constants.ts              [NUEVO] — HOME_BY_ROLE
├── pages/
│   ├── auth/LoginPage.tsx        [MODIFICAR]
│   └── public/PortalPage.tsx     [MODIFICAR]
├── routes/AppRoutes.tsx          [MODIFICAR]
├── components/Navbar.tsx         [MODIFICAR] — solo el botón "Salir"
└── App.tsx                       [MODIFICAR] — envolver con AuthProvider
```

---

## Fase 1 — Prerequisitos

- [ ] T101 Verificar contrato real del endpoint `/api/auth/login` con el backend. Levantarlo y probar con `curl`:

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

Confirmar:

- shape del request (`email` o `username`)
- shape de la respuesta (¿incluye `user` o solo `token`?)
- claim de roles en el JWT (`roles` vs `authorities` vs `scope`)
- prefijo del rol (`ROLE_FLEET_ADMIN` vs `FLEET_ADMIN`)

Decodificar el JWT con [jwt.io](https://jwt.io) o `node -e "console.log(JSON.parse(Buffer.from('<payload>', 'base64')))"` para ver el payload real.

- [ ] T102 Si el contrato real difiere de lo asumido en la decisión 7, ajustar `src/types/auth.ts` y `roleFromClaims()` antes de continuar. Documentar la divergencia con un comentario en el plan.
- [ ] T103 Verificar que PLAN-00 está cerrado: `npm run dev` levanta en `:5173` y el proxy `/api → :8080` funciona.

---

## Fase 2 — Tipos, storage y constantes

- [ ] T104 Crear `src/types/auth.ts`:

```ts
export type Role = "FLEET_ADMIN" | "DISPATCHER" | "DRIVER";

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: AuthUser;
}

export interface JwtClaims {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
}
```

- [ ] T105 Instalar `jwt-decode`:

```bash
npm install jwt-decode
```

- [ ] T106 Crear `src/lib/authStorage.ts`:

```ts
import type { AuthUser } from "@/types/auth";

const TOKEN_KEY = "auth.token";
const USER_KEY = "auth.user";

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  setUser: (user: AuthUser): void => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
```

- [ ] T107 Crear `src/auth/constants.ts`:

```ts
import type { Role } from "@/types/auth";

export const HOME_BY_ROLE: Record<Role, string> = {
  FLEET_ADMIN: "/admin",
  DISPATCHER: "/despachador",
  DRIVER: "/conductor",
};
```

---

## Fase 3 — Servicio de auth

- [ ] T108 Crear `src/services/auth.ts`:

```ts
import { jwtDecode } from "jwt-decode";
import { api } from "./api";
import type { JwtClaims, LoginRequest, LoginResponse, Role } from "@/types/auth";

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/auth/login", payload);
}

export function decodeJwt(token: string): JwtClaims {
  return jwtDecode<JwtClaims>(token);
}

export function roleFromClaims(claims: JwtClaims): Role | null {
  const raw = claims.roles?.[0]?.replace(/^ROLE_/, "");
  if (raw === "FLEET_ADMIN" || raw === "DISPATCHER" || raw === "DRIVER") return raw;
  return null;
}

export function isExpired(claims: JwtClaims): boolean {
  return Date.now() / 1000 >= claims.exp;
}
```

- [ ] T109 Test unitario `src/services/auth.test.ts`:
  - `roleFromClaims({ roles: ["ROLE_DISPATCHER"], ... })` → `"DISPATCHER"`
  - `roleFromClaims({ roles: ["DISPATCHER"], ... })` → `"DISPATCHER"` (sin prefijo `ROLE_`)
  - `roleFromClaims({ roles: [], ... })` → `null`
  - `roleFromClaims({ roles: ["ROLE_UNKNOWN"], ... })` → `null`
  - `isExpired({ exp: now - 100, ... })` → `true`
  - `isExpired({ exp: now + 3600, ... })` → `false`

---

## Fase 4 — AuthContext y useAuth

- [ ] T110 Crear `src/auth/AuthContext.tsx`:

```tsx
import { createContext, ReactNode, useEffect, useState } from "react";
import { authStorage } from "@/lib/authStorage";
import { decodeJwt, isExpired, login as loginRequest, roleFromClaims } from "@/services/auth";
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
```

- [ ] T111 Crear `src/auth/useAuth.ts`:

```ts
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
```

- [ ] T112 Modificar `src/App.tsx` — envolver `<AppRoutes />` con `<AuthProvider>` **dentro** de `<BrowserRouter>`:

```tsx
<BrowserRouter>
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
</BrowserRouter>
```

> **Por qué dentro:** si en el futuro AuthProvider necesita `useNavigate` (por ejemplo para forzar redirect en logout), debe estar bajo `BrowserRouter`. Hoy no lo usa, pero el orden correcto evita refactor a futuro.

---

## Fase 5 — ProtectedRoute

- [ ] T113 Crear `src/auth/ProtectedRoute.tsx`:

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { HOME_BY_ROLE } from "./constants";
import { useAuth } from "./useAuth";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  roles?: Role[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || !role) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to={HOME_BY_ROLE[role]} replace />;

  return <Outlet />;
}
```

- [ ] T114 Test `src/auth/ProtectedRoute.test.tsx` (con `MemoryRouter` + mock de `useAuth`):
  - Sin token → redirige a `/login`
  - Con token y rol incorrecto → redirige a home del rol real
  - Con token y rol correcto → renderiza `<Outlet />`

---

## Fase 6 — Wiring de rutas

- [ ] T115 Modificar [src/routes/AppRoutes.tsx](../../src/routes/AppRoutes.tsx) — agrupar las rutas por rol bajo `<Route element={<ProtectedRoute roles={[...]} />}>`:

```tsx
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/auth/ProtectedRoute";

import LandingPage from "@/pages/public/LandingPage";
import PortalPage from "@/pages/public/PortalPage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import LoginPage from "@/pages/auth/LoginPage";

import DespachadorPage from "@/pages/despachador/DespachadorPage";
import DespachadorDetallePage from "@/pages/despachador/DespachadorDetallePage";
import DespachadorDespachoPage from "@/pages/despachador/DespachadorDespachoPage";
import DespachadorHistorialPage from "@/pages/despachador/DespachadorHistorialPage";
import DespachadorAlertasPage from "@/pages/despachador/DespachadorAlertasPage";

import ConductorPage from "@/pages/conductor/ConductorPage";
import ConductorParadaPage from "@/pages/conductor/ConductorParadaPage";
import ConductorCierrePage from "@/pages/conductor/ConductorCierrePage";

import AdminPage from "@/pages/admin/AdminPage";
import AdminRegistrarPage from "@/pages/admin/AdminRegistrarPage";
import AdminRegistrarConductorPage from "@/pages/admin/AdminRegistrarConductorPage";
import AdminAsignacionesPage from "@/pages/admin/AdminAsignacionesPage";
import AdminVehiculoDetallePage from "@/pages/admin/AdminVehiculoDetallePage";
import AdminVehiculoEditarPage from "@/pages/admin/AdminVehiculoEditarPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/portal" element={<PortalPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["DISPATCHER"]} />}>
        <Route path="/despachador">
          <Route index element={<DespachadorPage />} />
          <Route path="ruta/:id" element={<DespachadorDetallePage />} />
          <Route path="despacho/:id" element={<DespachadorDespachoPage />} />
          <Route path="historial" element={<DespachadorHistorialPage />} />
          <Route path="alertas" element={<DespachadorAlertasPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["DRIVER"]} />}>
        <Route path="/conductor">
          <Route index element={<ConductorPage />} />
          <Route path="parada/:id" element={<ConductorParadaPage />} />
          <Route path="cierre" element={<ConductorCierrePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["FLEET_ADMIN"]} />}>
        <Route path="/admin">
          <Route index element={<AdminPage />} />
          <Route path="registrar" element={<AdminRegistrarPage />} />
          <Route path="registrar-conductor" element={<AdminRegistrarConductorPage />} />
          <Route path="asignaciones" element={<AdminAsignacionesPage />} />
          <Route path="vehiculo/:placa" element={<AdminVehiculoDetallePage />} />
          <Route path="vehiculo/:placa/editar" element={<AdminVehiculoEditarPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

## Fase 7 — LoginPage real

- [ ] T116 Modificar [src/pages/auth/LoginPage.tsx](../../src/pages/auth/LoginPage.tsx). Reemplazar el `handleSubmit` actual:

```tsx
import { useAuth } from "@/auth/useAuth";
import { HOME_BY_ROLE } from "@/auth/constants";
import { ApiError } from "@/services/api";

// ... dentro del componente:
const { login } = useAuth();
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    setError("Ingresa correo y contraseña.");
    return;
  }
  setError(null);
  setLoading(true);
  try {
    const role = await login({ email, password });
    navigate(HOME_BY_ROLE[role], { replace: true });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      setError("Credenciales incorrectas.");
    } else {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    }
  } finally {
    setLoading(false);
  }
};
```

Renderizar `error` debajo del input de password si está presente (rojo, similar a otros mensajes de error en la UI).

---

## Fase 8 — PortalPage como redirector

- [ ] T117 Reemplazar todo el contenido de [src/pages/public/PortalPage.tsx](../../src/pages/public/PortalPage.tsx) por:

```tsx
import { Navigate } from "react-router-dom";
import { HOME_BY_ROLE } from "@/auth/constants";
import { useAuth } from "@/auth/useAuth";

export default function PortalPage() {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  return <Navigate to={HOME_BY_ROLE[role]} replace />;
}
```

> El selector visual de 3 roles desaparece. Con auth real el rol viene del token.

---

## Fase 9 — Logout en Navbar

- [ ] T118 Modificar [src/components/Navbar.tsx:22](../../src/components/Navbar.tsx#L22). Cambiar el botón "Salir":

```tsx
import { useAuth } from "@/auth/useAuth";

// dentro del componente:
const { logout } = useAuth();

// reemplazar onClick del botón "Salir":
onClick={() => {
  logout();
  navigate("/login", { replace: true });
}}
```

> [ConductorPage.tsx](../../src/pages/conductor/ConductorPage.tsx) tiene su propio header inline (no usa `<Navbar>`); su botón "← Inicio" en línea 19 también debe llamar `logout()`. Anotado para T119.

- [ ] T119 [ConductorPage.tsx:19](../../src/pages/conductor/ConductorPage.tsx#L19): aplicar el mismo cambio (`logout()` + `navigate("/login")`) al botón "← Inicio".

---

## Fase 10 — Validación

- [ ] T120 Backend levantado en `:8080` con al menos un usuario seed por rol. `npm run dev`.
- [ ] T121 Login flow E2E manual:
  1. `/login` → ingresar credenciales válidas de un `FLEET_ADMIN` → redirige a `/admin`
  2. Recargar `/admin` → sigue logueado, no vuelve a `/login`
  3. Click "Salir" → redirige a `/login`, `localStorage` limpio (verificar en DevTools)
  4. Repetir para `DISPATCHER` (debería ir a `/despachador`) y `DRIVER` (a `/conductor`)
  5. Modificar manualmente el token en localStorage para forzar `exp` en el pasado → recargar → redirige a `/login`
- [ ] T122 Tests de protección:
  - `/admin` sin login → `/login`
  - `/despachador` con token de `DRIVER` → redirige a `/conductor` (HOME_BY_ROLE)
  - `/portal` logueado → redirige al home del rol
  - `/portal` sin login → `/login`
- [ ] T123 Login con credenciales inválidas → muestra "Credenciales incorrectas" sin loop ni navegación
- [ ] T124 `npm run typecheck`, `npm run lint`, `npm run test` pasan
- [ ] T125 Tests unitarios mínimos correctos:
  - `src/services/auth.test.ts` (T109)
  - `src/auth/ProtectedRoute.test.tsx` (T114)

---

## ✅ Checkpoint 1

- Login real contra el backend funciona y guarda token + user en localStorage.
- Sesión persiste entre recargas; token expirado limpia sesión al cargar.
- Las tres áreas (`/admin`, `/despachador`, `/conductor`) están protegidas por rol.
- `/portal` redirige automáticamente al home del rol del usuario logueado.
- Login fallido muestra mensaje sin romper la UI.
- Logout limpia localStorage y navega a `/login`.
- **Las pantallas de despachador / conductor / admin siguen leyendo `mockData.ts`** — la integración con queries reales es PLAN-02 en adelante.

---

## Orden Total de Ejecución

```
Sprint 0 — Config inicial (PLAN-00)
    └── Sprint 1 — Auth y rutas protegidas (PLAN-01)        ← Este archivo
            └── Sprint 2 — Servicios + React Query (PLAN-02)
                    └── Sprint 3 — Admin de flota integrado (PLAN-03)
                            └── Sprint 4 — Despachador integrado (PLAN-04)
                                    └── Sprint 5 — Conductor + offline + POD (PLAN-05)
                                            └── Sprint 6 — Limpieza final (PLAN-06)
```
