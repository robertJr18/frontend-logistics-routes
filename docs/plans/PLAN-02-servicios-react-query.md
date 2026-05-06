# PLAN-02 — Capa de Servicios y React Query

**Date:** 2026-05-05
**Sprint:** 2 (depende de PLAN-01)
**Backend pareado:** todos los endpoints REST del backend (`/api/vehiculos`, `/api/conductores`, `/api/despacho`, `/api/conductor`, `/api/planificacion`).

---

## Summary

Convertir la app en una SPA capaz de consumir cualquier endpoint protegido del backend. Esto implica: inyectar el JWT en cada request, manejar 401/403 globalmente para forzar logout, configurar `QueryClient` con defaults razonables, y dejar establecidas las **convenciones** que los planes posteriores (PLAN-03/04/05) van a seguir para crear sus DTOs, mappers, services y hooks por dominio.

**Este plan NO crea hooks ni mappers de ningún dominio** (vehículos, rutas, paradas, etc.). Solo deja la infraestructura y las reglas. Cada PLAN posterior implementa lo suyo siguiendo el patrón documentado acá.

---

## Decisiones

### 1. Auth interceptor en `api.ts`

**Decisión:** modificar [src/services/api.ts](../../src/services/api.ts) para que cada request lea el token de `authStorage` y lo inyecte como `Authorization: Bearer <token>`. Sin migración a Axios — `fetch` envuelto basta.

**Por qué no Axios:** el wrapper actual es 30 líneas y funciona. Migrar a Axios solo por interceptores agrega 13kB al bundle y un patrón distinto al equipo. Mantener `fetch`.

### 2. Manejo de 401 vía evento global

**Decisión:** cuando `request()` recibe `401`, despacha `window.dispatchEvent(new CustomEvent("auth:unauthorized"))` y luego lanza el `ApiError`. `AuthProvider` escucha el evento y ejecuta `logout()`.

**Por qué evento y no callback:** mantiene `api.ts` desacoplado de React. El día que reemplacemos `AuthContext` por algo distinto (Redux, Zustand), `api.ts` no se entera.

**403 (forbidden):** NO dispara logout — el usuario está autenticado pero no autorizado para ese recurso. Se propaga como `ApiError` y la pantalla decide qué hacer (toast "Sin permisos" o redirigir).

### 3. QueryClient con defaults conservadores

**Decisión:**

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30s — balance fresh vs traffic
      gcTime: 5 * 60_000,          // 5min — datos en cache después de unmount
      refetchOnWindowFocus: false, // evita ruido en operación de campo
      retry: (failureCount, error) => {
        if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) return false;
        return failureCount < 1;   // un solo retry para errores transitorios
      },
    },
    mutations: {
      retry: 0,                    // mutaciones nunca se reintentan automáticamente
    },
  },
})
```

**Por qué `refetchOnWindowFocus: false`:** el conductor en campo cambia de tab/app constantemente; refetch en cada foco satura. Cada hook puede sobrescribirlo si lo necesita.

### 4. Mantener tipos UI en español; introducir DTOs en MAYÚSCULAS

**Decisión:** los tipos UI actuales en [src/types/domain.ts](../../src/types/domain.ts) (`"Creada"`, `"En Tránsito"`, etc.) se conservan para no refactorizar todas las pantallas del compañero. En paralelo se introducen los DTOs del backend (`"CREADA"`, `"EN_TRANSITO"`) en `src/types/dto/`. Los mappers traducen DTO → UI.

**Por qué no unificar ahora:** unificar implica tocar las 14 pantallas del prototipo. PLAN-06 (limpieza) hace la unificación cuando ya esté todo integrado y los riesgos de regresión sean menores.

### 5. Convención de carpetas y archivos

**Decisión:** patrón consistente que cada PLAN posterior aplica:

```
src/
├── types/
│   ├── domain.ts              ← tipos UI (existente, no se toca acá)
│   └── dto/
│       └── <dominio>.ts       ← contratos del backend (uno por recurso)
├── services/
│   ├── api.ts                 ← wrapper fetch (modificado en este plan)
│   ├── auth.ts                ← creado en PLAN-01
│   ├── <dominio>.ts           ← funciones que llaman al backend (getRutas, postConfirmar, etc.)
│   └── mappers/
│       └── <dominio>.ts       ← DTO → UI domain (toRuta, toVehiculo, ...)
├── hooks/
│   └── <dominio>/
│       ├── useRutas.ts        ← useQuery list
│       ├── useRuta.ts         ← useQuery detail
│       └── useConfirmarDespacho.ts  ← useMutation
└── lib/
    ├── queryKeys.ts           ← factory tipado de query keys
    └── formatters.ts          ← formateadores compartidos (formatRouteStatus, etc.)
```

### 6. Convención de query keys con factory tipado

**Decisión:** centralizar en [src/lib/queryKeys.ts](../../src/lib/queryKeys.ts) un factory por dominio:

```ts
export const queryKeys = {
  vehiculos: {
    all: ["vehiculos"] as const,
    list: () => [...queryKeys.vehiculos.all, "list"] as const,
    detail: (id: string) => [...queryKeys.vehiculos.all, "detail", id] as const,
    disponibilidad: () => [...queryKeys.vehiculos.all, "disponibilidad"] as const,
  },
  // ... un namespace por dominio
};
```

**Por qué factory tipado:** las invalidaciones (`queryClient.invalidateQueries({ queryKey: queryKeys.vehiculos.all })`) quedan refactor-safe. Strings sueltos como `["vehiculos", "list"]` se desincronizan en silencio cuando alguien renombra.

PLAN-02 deja `queryKeys.ts` con un namespace de **ejemplo** (vehículos). Cada PLAN posterior añade su namespace.

### 7. Convención de hooks: Query y Mutation

**Decisión:** patrón estricto para reducir variabilidad entre integrantes:

```ts
// Query (lectura)
export function useVehiculos() {
  return useQuery({
    queryKey: queryKeys.vehiculos.list(),
    queryFn: () => vehiculoService.listar().then(dtos => dtos.map(toVehiculo)),
  });
}

// Mutation (escritura)
export function useRegistrarVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: RegistrarVehiculoRequest) => vehiculoService.registrar(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all }),
  });
}
```

**Reglas:**
- Un hook = una operación (no `useVehiculos()` que devuelva CRUD entero).
- El mapper se invoca dentro del `queryFn`, no fuera. La pantalla recibe tipos UI listos.
- `onSuccess` invalida la query "raíz" del dominio (`.all`) salvo que el cambio sea muy local. Mejor sobre-invalidar y simplificar.
- Mutaciones devuelven el hook completo de React Query (`mutate`, `mutateAsync`, `isPending`, etc.) — no se exponen abstracciones encima.

### 8. Sin global error handler — manejo por componente

**Decisión:** cada pantalla maneja sus errores donde tenga sentido (toast, inline). No hay un `ErrorBoundary` global ni un `onError` por defecto en el QueryClient (más allá del retry skip).

**Por qué:** los errores en un dashboard del despachador y en la pantalla offline del conductor se manejan distinto. Un handler global obliga a mensajes genéricos.

`ApiError` con `status` está disponible — cada hook se beneficia de él según necesite.

---

## Estado actual (delta a aplicar)

| Archivo | Estado | Acción |
|---|---|---|
| [src/services/api.ts](../../src/services/api.ts) | Sin Authorization, sin handling 401 | Inyectar header desde `authStorage`, despachar evento en 401 |
| [src/auth/AuthContext.tsx](../../src/auth/AuthContext.tsx) | (Creado en PLAN-01) | Suscribirse a `auth:unauthorized` y llamar `logout()` |
| [src/App.tsx](../../src/App.tsx) | `new QueryClient()` sin opciones | Pasar `defaultOptions` documentados en decisión 3 |
| `src/lib/queryKeys.ts` | No existe | Crear con namespace de ejemplo |
| `src/lib/formatters.ts` | No existe | Crear con `formatRouteStatus`, `formatVehicleStatus`, `formatStopStatus` |
| `src/types/dto/` | No existe | Crear carpeta vacía con `.gitkeep` (cada PLAN posterior agrega su archivo) |
| `src/services/mappers/` | No existe | Crear carpeta vacía con `.gitkeep` |
| `src/hooks/` | No existe | Crear carpeta vacía con `.gitkeep` |
| `src/env.d.ts` | (Creado en PLAN-00) | Agregar declaración de `WindowEventMap["auth:unauthorized"]` |

---

## Estructura de archivos nuevos

```
src/
├── lib/
│   ├── authStorage.ts           (PLAN-01)
│   ├── queryKeys.ts             [NUEVO] — factory tipado
│   └── formatters.ts            [NUEVO] — DTO enum → label UI
├── types/
│   └── dto/
│       └── .gitkeep             [NUEVO] — placeholder, llena PLAN-03+
├── services/
│   ├── api.ts                   [MODIFICAR] — interceptor + 401
│   ├── auth.ts                  (PLAN-01)
│   └── mappers/
│       └── .gitkeep             [NUEVO]
├── hooks/
│   └── .gitkeep                 [NUEVO]
├── auth/
│   └── AuthContext.tsx          [MODIFICAR] — listener auth:unauthorized
└── App.tsx                      [MODIFICAR] — QueryClient con defaults
```

---

## Fase 1 — Prerequisitos

- [ ] T201 Verificar que PLAN-01 está cerrado: login real funciona, `localStorage["auth.token"]` y `auth.user` se setean al loguearse, `logout()` los limpia.
- [ ] T202 Verificar que el backend está corriendo en `:8080` y al menos un endpoint protegido existe (p.ej. `GET /api/vehiculos/disponibilidad`). Probar con `curl` con un token válido capturado del login:

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}' | jq -r .token)
curl -i http://localhost:8080/api/vehiculos/disponibilidad -H "Authorization: Bearer $TOKEN"
```

Confirmar que retorna `200` con token válido y `401` sin él.

---

## Fase 2 — Auth interceptor en api.ts

- [ ] T203 Modificar [src/services/api.ts](../../src/services/api.ts) para inyectar el header `Authorization` desde `authStorage`:

```ts
import { authStorage } from "@/lib/authStorage";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean; // para /api/auth/login que no requiere token
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, skipAuth, ...rest } = options;

  const authHeader: Record<string, string> = {};
  if (!skipAuth) {
    const token = authStorage.getToken();
    if (token) authHeader["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeader,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined);
    throw new ApiError(response.status, `Request failed with status ${response.status}`, errorBody);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
```

- [ ] T204 Modificar [src/services/auth.ts](../../src/services/auth.ts) — `login()` debe usar `skipAuth: true` para no enviar Authorization (no hay token todavía):

```ts
export function login(payload: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/auth/login", payload, { skipAuth: true });
}
```

- [ ] T205 Agregar declaración de tipo en [src/env.d.ts](../../src/env.d.ts):

```ts
declare global {
  interface WindowEventMap {
    "auth:unauthorized": CustomEvent;
  }
}

export {};
```

---

## Fase 3 — Conectar AuthProvider al evento

- [ ] T206 Modificar [src/auth/AuthContext.tsx](../../src/auth/AuthContext.tsx) — agregar `useEffect` que escucha el evento global y dispara logout:

```tsx
useEffect(() => {
  const handler = () => {
    authStorage.clear();
    setUser(null);
    setRole(null);
  };
  window.addEventListener("auth:unauthorized", handler);
  return () => window.removeEventListener("auth:unauthorized", handler);
}, []);
```

> **Por qué no llamar `logout()` directamente:** crearía dependencia circular en el useEffect. La función inline replica los 3 pasos del logout sin necesidad de `useCallback`.

---

## Fase 4 — QueryClient configurado

- [ ] T207 Modificar [src/App.tsx](../../src/App.tsx) — pasar `defaultOptions` al `QueryClient`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/services/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && [401, 403, 404, 422].includes(error.status)) return false;
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## Fase 5 — Convenciones (factory de keys, formatters, carpetas)

- [ ] T208 Crear [src/lib/queryKeys.ts](../../src/lib/queryKeys.ts) con un namespace de ejemplo (vehículos) que sirva de plantilla para los siguientes planes:

```ts
export const queryKeys = {
  vehiculos: {
    all: ["vehiculos"] as const,
    list: () => [...queryKeys.vehiculos.all, "list"] as const,
    detail: (id: string) => [...queryKeys.vehiculos.all, "detail", id] as const,
    disponibilidad: () => [...queryKeys.vehiculos.all, "disponibilidad"] as const,
  },
  // PLAN-03 agrega: conductores
  // PLAN-04 agrega: rutas, despacho, paradas
  // PLAN-05 agrega: rutaActiva
};
```

- [ ] T209 Crear [src/lib/formatters.ts](../../src/lib/formatters.ts) con los formateadores de los enums backend → labels UI actuales:

```ts
import type { RouteStatus, StopStatus, VehicleStatus, DriverStatus } from "@/types/domain";

export function formatRouteStatus(dto: string): RouteStatus {
  const map: Record<string, RouteStatus> = {
    CREADA: "Creada",
    LISTA_PARA_DESPACHO: "Lista para Despacho",
    CONFIRMADA: "Confirmada",
    EN_TRANSITO: "En Tránsito",
    CERRADA_MANUAL: "Cerrada Manual",
    CERRADA_AUTOMATICA: "Cerrada Automática",
    CERRADA_FORZADA: "Cerrada Forzada",
  };
  return map[dto] ?? "Creada";
}

export function formatVehicleStatus(dto: string): VehicleStatus {
  const map: Record<string, VehicleStatus> = {
    DISPONIBLE: "Disponible",
    EN_TRANSITO: "En Tránsito",
    INACTIVO: "Inactivo",
  };
  return map[dto] ?? "Inactivo";
}

export function formatDriverStatus(dto: string): DriverStatus {
  const map: Record<string, DriverStatus> = {
    ACTIVO: "Activo",
    INACTIVO: "Inactivo",
    EN_RUTA: "Activo",  // EN_RUTA no existe en el tipo UI; se mapea a Activo (operacional)
  };
  return map[dto] ?? "Inactivo";
}

export function formatStopStatus(dto: string): StopStatus {
  const map: Record<string, StopStatus> = {
    PENDIENTE: "Pendiente",
    EXITOSA: "Exitosa",
    FALLIDA: "Fallida",
    NOVEDAD: "Novedad",
    SIN_GESTION_CONDUCTOR: "Pendiente",
    EXCLUIDA_DESPACHO: "Pendiente",
  };
  return map[dto] ?? "Pendiente";
}
```

> **Nota sobre `EN_RUTA` y `SIN_GESTION_CONDUCTOR`:** el tipo UI actual no contempla estos estados. Se mapean al equivalente más cercano en lo que PLAN-06 unifica los tipos UI con los del backend.

- [ ] T210 Crear las carpetas placeholder con `.gitkeep`:
  - `src/types/dto/.gitkeep`
  - `src/services/mappers/.gitkeep`
  - `src/hooks/.gitkeep`

---

## Fase 6 — Tests unitarios

- [ ] T211 Test `src/services/api.test.ts` (con `vi.fn` mockeando `fetch` y `authStorage`):
  - Request normal incluye header `Authorization: Bearer <token>` cuando hay token en storage
  - Request normal NO incluye Authorization si no hay token en storage
  - Request con `skipAuth: true` no incluye Authorization aunque haya token
  - Response 401 dispara `window.dispatchEvent` con evento `auth:unauthorized`
  - Response 401 también lanza `ApiError`
  - Response 403 lanza `ApiError` pero NO dispara evento (no logout)
  - Response 204 retorna `undefined`
  - Response 200 con JSON retorna el body parseado

- [ ] T212 Test `src/lib/formatters.test.ts`:
  - `formatRouteStatus("EN_TRANSITO")` → `"En Tránsito"`
  - `formatRouteStatus("CERRADA_AUTOMATICA")` → `"Cerrada Automática"`
  - `formatRouteStatus("DESCONOCIDO")` → fallback `"Creada"`
  - Idem para `formatVehicleStatus`, `formatDriverStatus`, `formatStopStatus`

- [ ] T213 Test `src/auth/AuthContext.test.tsx` — cuando se despacha `auth:unauthorized` desde fuera, el contexto debe limpiar `user` y `role`.

---

## Fase 7 — Validación E2E manual

- [ ] T214 Backend levantado en `:8080`. `npm run dev`.
- [ ] T215 Login como `FLEET_ADMIN`. Abrir DevTools → Network. Inspeccionar cualquier request de la app (cuando existan, en PLAN-03+):
  - Header `Authorization: Bearer <token>` presente
  - El token coincide con `localStorage["auth.token"]`
- [ ] T216 Forzar 401: borrar manualmente el token (`localStorage.removeItem("auth.token")`) y disparar una request al backend desde la consola:

```js
fetch("/api/vehiculos/disponibilidad").then(r => console.log(r.status))
```

  → debe responder 401 → la app debe limpiar la sesión y redirigir a `/login` (gracias al evento `auth:unauthorized` y al ProtectedRoute).

- [ ] T217 `npm run typecheck`, `npm run lint`, `npm run test` pasan.

---

## ✅ Checkpoint 2

- Todas las requests no marcadas con `skipAuth` envían `Authorization: Bearer <token>` automáticamente.
- 401 dispara logout global (limpia localStorage, AuthContext y redirige vía ProtectedRoute).
- 403 propaga `ApiError` sin tumbar la sesión.
- `QueryClient` configurado con defaults sensatos; los hooks futuros heredan automáticamente.
- Convenciones documentadas y carpetas creadas: `types/dto/`, `services/mappers/`, `hooks/`, `lib/queryKeys.ts`, `lib/formatters.ts`.
- **Ninguna pantalla integrada al backend todavía.** Las tres áreas siguen leyendo `mockData.ts`. Esa integración entra en PLAN-03/04/05 siguiendo las convenciones establecidas acá.

---

## Orden Total de Ejecución

```
Sprint 0 — Config inicial (PLAN-00)
    └── Sprint 1 — Auth y rutas protegidas (PLAN-01)
            └── Sprint 2 — Servicios + React Query (PLAN-02)        ← Este archivo
                    └── Sprint 3 — Admin de flota integrado (PLAN-03)
                            └── Sprint 4 — Despachador integrado (PLAN-04)
                                    └── Sprint 5 — Conductor + offline + POD (PLAN-05)
                                            └── Sprint 6 — Limpieza final (PLAN-06)
```
