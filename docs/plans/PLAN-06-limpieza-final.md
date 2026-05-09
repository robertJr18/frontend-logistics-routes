# PLAN-06 — Limpieza Final

**Date:** 2026-05-05
**Sprint:** 6 (depende de PLAN-05)
**Backend pareado:** ninguno — este plan no toca backend.

---

## Summary

Cerrar las deudas técnicas que los planes 01–05 dejaron explícitamente diferidas: eliminar `mockData.ts` y la carpeta `data/`, unificar los tipos UI con los DTOs del backend (hoy son dos modelos paralelos con mappers en el medio), resolver la deuda del modo `strict` que pudo haber quedado en PLAN-00, retirar `PortalPage` (que quedó como redirector vestigial), saldar todos los `// TODO PLAN-XX` que se sembraron, agregar tests E2E mínimos para los 3 flujos principales y documentar el setup en un `README.md`.

**Este plan no agrega features.** Cualquier mejora opcional documentada en planes anteriores (firma con canvas, WebSocket de alertas, migración a `react-hook-form`, íconos PWA PNG) queda fuera de scope y se documenta al final como "mejoras futuras".

---

## Decisiones

### 1. Unificar tipos UI con DTOs uppercase

PLAN-02 (decisión 4) mantuvo dos modelos paralelos: tipos UI en español (`"Creada"`, `"En Tránsito"`) y DTOs en MAYÚSCULAS (`"CREADA"`, `"EN_TRANSITO"`), con mappers en `lib/formatters.ts` traduciendo. Era una decisión defensiva para no refactorizar el prototipo del compañero todo de una vez.

**Decisión:** unificar usando el formato del backend como fuente de verdad. Los tipos UI pasan a usar las mismas constantes uppercase. Los formatters ahora son **funciones de display** (`statusLabel`, no `formatStatus` ni `mapStatus`).

**Antes:**

```ts
// types/domain.ts
type RouteStatus = "Creada" | "En Tránsito" | ...;

// componentes
ruta.estado === "Creada"

// mapper
toRuta(dto): Ruta { estado: formatRouteStatus(dto.estado) }
```

**Después:**

```ts
// types/domain.ts
type RouteStatus = "CREADA" | "EN_TRANSITO" | ...;  // re-exporta de DTO

// componentes
ruta.estado === "CREADA"

// mapper (mucho más simple)
toRuta(dto): Ruta { estado: dto.estado }

// display en JSX
<span>{statusLabel(ruta.estado)}</span>  // "Creada"
```

**Por qué ahora y no en PLAN-02:** ahora todas las pantallas YA pasaron por integración. Cualquier comparación de string que rompa va a salir en los tests E2E que agrega este mismo plan. Hacerlo en PLAN-02 con todas las pantallas todavía leyendo mockData habría sido más difícil de validar.

### 2. Eliminar `mockData.ts` y `data/`

Una vez las pantallas leen de hooks, `mockData.ts` solo se usa para tests (si acaso) y como referencia. Borrarlo evita que alguien lo importe de nuevo por accidente.

**Decisión:** eliminar [src/data/mockData.ts](../../src/data/mockData.ts) completo. Si los tests necesitan fixtures, mover a `src/test/fixtures/` con datos mínimos por test. Las constantes `zonas` y `capacidadVehiculo` (las únicas no obsoletas) migran a `src/lib/constants.ts`.

### 3. Eliminar `PortalPage`

PLAN-01 (decisión 6) lo dejó como redirector "para no romper el `Navbar.backTo`". Ahora `backTo` puede leer el rol del `useAuth()` y redirigir al home correspondiente directamente.

**Decisión:**

- Modificar [Navbar.tsx](../../src/components/Navbar.tsx) para que `backTo` sea opcional y, si no se pasa, use `HOME_BY_ROLE[role]` del contexto.
- Eliminar [src/pages/public/PortalPage.tsx](../../src/pages/public/PortalPage.tsx).
- Eliminar la ruta `/portal` de [AppRoutes.tsx](../../src/routes/AppRoutes.tsx).
- En login (T116 PLAN-01), el `navigate(HOME_BY_ROLE[role])` ya redirige directo — no pasa por `/portal`.

### 4. Strict mode TypeScript: cerrar la deuda

PLAN-00 (T008) dejó abierta la posibilidad de diferir `strict: true` si rompía el código del compañero. Si quedó diferido, este plan lo cierra: ahora con todas las pantallas refactorizadas, los errores de strict son menores y delimitados.

**Decisión:** activar `strict: true` definitivamente. Resolver los errores que aparezcan. Si alguno requiere refactor mayor (improbable a estas alturas), documentarlo y resolverlo aquí mismo.

### 5. Tests E2E con Vitest + Testing Library, sin Playwright

**Decisión:** agregar tests de integración con `@testing-library/react` para los 3 flujos críticos (login, registro de parada, confirmación de despacho), mockeando el backend con `msw` (Mock Service Worker).

**Por qué no Playwright:** Playwright suma una dependencia de browser pesada y un nuevo runner. Para "tests E2E mínimos" del scope del PLAN-06, RTL + msw cubre los flujos sin instalar browsers. Si en el futuro se quiere E2E real (multi-tab, real browser), se diseña un plan dedicado.

### 6. Mejoras futuras explícitas (no scope)

Lo que se queda **fuera** y se documenta como referencia para futuro:

- **Firma del receptor con canvas** (PLAN-05 decisión): hoy el placeholder visual existe pero no captura firma real. Requiere `react-signature-canvas` o similar.
- **WebSocket para alertas en tiempo real** (PLAN-04 decisión 5): hoy las alertas se derivan client-side cada 30s. Real-time vía Spring WebSocket queda como mejora.
- **Migración a `react-hook-form` + `zod`** (PLAN-03 decisión 8): los forms admin siguen con `useState`. Refactor que quita boilerplate y mejora UX de validación.
- **Íconos PWA PNG 192/512** (PLAN-05): hoy `manifest.webmanifest` referencia solo el `favicon.svg`. Para una instalación pulida en Android, hacen falta PNGs.
- **Endpoint de historial backend** (PLAN-04 T401): si quedó pendiente.
- **Compresión de fotos POD antes de IndexedDB** (PLAN-05): blob crudo de 5MB satura el storage. Comprimir a 800px / 80% jpeg al captura.

Cada uno puede ser un PR aparte cuando el equipo lo priorice. No se documentan como planes (PLAN-XX-\*) hasta que se quieran abordar.

---

## Estado actual (delta a aplicar)

| Archivo                                                                  | Estado                                      | Acción                                                                  |
| ------------------------------------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------- |
| [src/types/domain.ts](../../src/types/domain.ts)                         | Tipos en español ("Creada", "En Tránsito")  | Re-exportar tipos uppercase desde `types/dto/` o redefinir como aliases |
| [src/lib/formatters.ts](../../src/lib/formatters.ts)                     | Funciones tipo `formatXStatus(dto): UIType` | Renombrar a `xStatusLabel(value): string` (display only)                |
| [src/components/StatusBadge.tsx](../../src/components/StatusBadge.tsx)   | `getRouteStatusVariant("Creada")`           | Cambiar a `getRouteStatusVariant("CREADA")`                             |
| Todos los componentes                                                    | Comparan `ruta.estado === "Creada"`         | Cambiar a `=== "CREADA"`                                                |
| Todos los mappers                                                        | Llaman `formatXStatus(dto.estado)`          | Devolver `dto.estado` directamente                                      |
| [src/data/mockData.ts](../../src/data/mockData.ts)                       | Existe                                      | Eliminar                                                                |
| [src/pages/public/PortalPage.tsx](../../src/pages/public/PortalPage.tsx) | Redirector                                  | Eliminar                                                                |
| [src/routes/AppRoutes.tsx](../../src/routes/AppRoutes.tsx)               | Ruta `/portal` activa                       | Eliminar la ruta                                                        |
| [src/components/Navbar.tsx](../../src/components/Navbar.tsx)             | `backTo` default `/portal`                  | `backTo` opcional, default = home del rol                               |
| [tsconfig.app.json](../../tsconfig.app.json)                             | `strict: ?` (depende de T008)               | Confirmar `strict: true` y resolver errores remanentes                  |
| `README.md`                                                              | No existe                                   | Crear con setup, scripts, env vars, estructura                          |
| `src/lib/constants.ts`                                                   | No existe                                   | Mover `zonas`, `capacidadVehiculo` desde mockData                       |

---

## Fase 1 — Verificación de prerequisitos

- [ ] T601 Verificar que PLAN-01 a PLAN-05 están cerrados:
  - Login real funciona (PLAN-01)
  - Authorization header automático (PLAN-02)
  - 6 pantallas admin sin mockData (PLAN-03)
  - 5 pantallas despachador sin mockData (PLAN-04)
  - 3 pantallas conductor con offline + POD (PLAN-05)
- [ ] T602 Listar todos los `// TODO PLAN-XX` o `// TODO PLAN-06` actualmente presentes en el código (con `grep -r "TODO PLAN" src/`). Confirmar que ninguno queda sin cerrar al final del sprint.

---

## Fase 2 — Migrar `lib/constants.ts` y borrar mockData

- [ ] T603 Crear [src/lib/constants.ts](../../src/lib/constants.ts) con lo único reutilizable de mockData:

```ts
import type { TipoVehiculoDto } from "@/types/dto/vehiculo";

export const zonas = [
  "Zona Norte, Santa Marta",
  "Zona Centro, Santa Marta",
  "Zona Rodadero, Santa Marta",
  "Zona Mamatoco, Santa Marta",
  "Zona Gaira, Santa Marta",
  "Zona Bonda, Santa Marta",
  "Zona Bello Horizonte, Santa Marta",
  "Zona Taganga, Santa Marta",
  "Zona El Prado, Barranquilla",
  "Zona Soledad, Barranquilla",
  "Zona Única, Ciénaga",
];

export const capacidadVehiculo: Record<TipoVehiculoDto, number> = {
  MOTO: 20,
  VAN: 500,
  NHR: 2000,
  TURBO: 4500,
};
```

- [ ] T604 Buscar y reemplazar imports:
  - `from "@/data/mockData"` → `from "@/lib/constants"` cuando sea `zonas` o `capacidadVehiculo`
  - Cualquier otro import de `mockData` debe haber desaparecido en PLAN-03/04/05; si queda alguno → bug.
- [ ] T605 Eliminar [src/data/mockData.ts](../../src/data/mockData.ts) y la carpeta `src/data/` si queda vacía.
- [ ] T606 `npm run typecheck` pasa sin errores de import roto.

---

## Fase 3 — Unificar tipos UI con DTOs

- [ ] T607 Modificar [src/types/domain.ts](../../src/types/domain.ts) para re-exportar los tipos del backend:

```ts
import type { EstadoRutaDto, TipoCierreDto } from "./dto/ruta";
import type { EstadoParadaDto, MotivoNovedadDto } from "./dto/parada";
import type { EstadoVehiculoDto, TipoVehiculoDto } from "./dto/vehiculo";
import type { EstadoConductorDto, ModeloContratoDto } from "./dto/conductor";

export type RouteStatus = EstadoRutaDto;
export type StopStatus = EstadoParadaDto;
export type VehicleType = TipoVehiculoDto;
export type VehicleStatus = EstadoVehiculoDto;
export type DriverStatus = EstadoConductorDto;
export type ModeloContrato = ModeloContratoDto;

// Las interfaces de Ruta, Vehiculo, Conductor, Parada se mantienen
// pero sus campos de estado/tipo ahora usan los aliases uppercase.
```

- [ ] T608 Actualizar [src/lib/formatters.ts](../../src/lib/formatters.ts) — convertir las funciones a **labels de display** (no mappers de tipo):

```ts
import type {
  RouteStatus,
  StopStatus,
  VehicleStatus,
  DriverStatus,
  ModeloContrato,
  VehicleType,
} from "@/types/domain";

export const routeStatusLabel: Record<RouteStatus, string> = {
  CREADA: "Creada",
  LISTA_PARA_DESPACHO: "Lista para Despacho",
  CONFIRMADA: "Confirmada",
  EN_TRANSITO: "En Tránsito",
  CERRADA_MANUAL: "Cerrada Manual",
  CERRADA_AUTOMATICA: "Cerrada Automática",
  CERRADA_FORZADA: "Cerrada Forzada",
};

export const vehicleStatusLabel: Record<VehicleStatus, string> = {
  DISPONIBLE: "Disponible",
  EN_TRANSITO: "En Tránsito",
  INACTIVO: "Inactivo",
};

export const driverStatusLabel: Record<DriverStatus, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  EN_RUTA: "En Ruta",
};

export const stopStatusLabel: Record<StopStatus, string> = {
  PENDIENTE: "Pendiente",
  EXITOSA: "Exitosa",
  FALLIDA: "Fallida",
  NOVEDAD: "Novedad",
  SIN_GESTION_CONDUCTOR: "Sin gestión",
  EXCLUIDA_DESPACHO: "Excluida",
};

export const tipoVehiculoLabel: Record<VehicleType, string> = {
  MOTO: "Moto",
  VAN: "Van",
  NHR: "NHR",
  TURBO: "Turbo",
};

export const modeloContratoLabel: Record<ModeloContrato, string> = {
  RECORRIDO_COMPLETO: "Recorrido completo",
  POR_PARADA: "Por parada",
};
```

> **Nota:** los enums adicionales que en PLAN-02 mapeaban "imperfectamente" (`EN_RUTA → Activo`, `SIN_GESTION_CONDUCTOR → Pendiente`) ahora tienen su propio label correcto. Las pantallas que filtran por estado deben usar el valor real (no asumir compatibilidad con el modelo viejo).

- [ ] T609 Simplificar mappers en [src/services/mappers/](../../src/services/mappers/) — los campos de estado/tipo se asignan directo desde DTO:

```ts
// mappers/vehiculo.ts (simplificado)
export function toVehiculo(dto: VehiculoResponse, conductores: ConductorResponse[] = []): Vehiculo {
  return {
    id: dto.id,
    placa: dto.placa,
    tipo: dto.tipo, // antes: formatTipoVehiculo(dto.tipo)
    modelo: dto.modelo,
    capacidadPeso: dto.capacidadPesoKg,
    volumenMax: dto.volumenMaximoM3,
    zona: dto.zonaOperacion,
    estado: dto.estado, // antes: formatVehicleStatus(dto.estado)
    conductorAsignado: dto.conductorId
      ? (conductores.find((c) => c.id === dto.conductorId)?.nombre ?? null)
      : null,
  };
}
```

Aplicar la misma simplificación a [mappers/conductor.ts](../../src/services/mappers/conductor.ts), [mappers/ruta.ts](../../src/services/mappers/ruta.ts), [mappers/parada.ts](../../src/services/mappers/parada.ts).

- [ ] T610 Actualizar [src/components/StatusBadge.tsx](../../src/components/StatusBadge.tsx) — los maps `getRouteStatusVariant` etc. ahora reciben uppercase:

```ts
export function getRouteStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    CREADA: "creada",
    LISTA_PARA_DESPACHO: "lista-despacho",
    CONFIRMADA: "confirmada",
    EN_TRANSITO: "en-transito",
    CERRADA_MANUAL: "cerrada-manual",
    CERRADA_AUTOMATICA: "cerrada-automatica",
    CERRADA_FORZADA: "cerrada-forzada",
  };
  return map[status] ?? "creada";
}
```

Idem para `getVehicleStatusVariant`, `getStopStatusVariant`.

- [ ] T611 Actualizar el JSX de **todas las pantallas** donde se compara un estado:
  - `ruta.estado === "Creada"` → `ruta.estado === "CREADA"` (pasar replace_all selectivo en cada archivo).
  - `<StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{ruta.estado}</StatusBadge>` → `<StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{routeStatusLabel[ruta.estado]}</StatusBadge>`
  - Similar para `parada.status`, `vehiculo.estado`, `conductor.estado`.

> **Detalle pesado pero mecánico:** este es el cambio más amplio en líneas. Hacerlo archivo por archivo, correr `npm run typecheck` después de cada uno, ir cerrando errores rápidamente.

- [ ] T612 `npm run typecheck` y `npm run test` pasan en verde después de la migración.

---

## Fase 4 — Eliminar PortalPage y `/portal`

- [ ] T613 Modificar [src/components/Navbar.tsx](../../src/components/Navbar.tsx) — `backTo` opcional, default dinámico:

```tsx
import { HOME_BY_ROLE } from "@/auth/constants";
import { useAuth } from "@/auth/useAuth";

interface NavbarProps {
  title: string;
  backTo?: string;
}

export default function Navbar({ title, backTo }: NavbarProps) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const target = backTo ?? (role ? HOME_BY_ROLE[role] : "/login");
  // ... usar `target` en navigate
}
```

- [ ] T614 Eliminar [src/pages/public/PortalPage.tsx](../../src/pages/public/PortalPage.tsx).
- [ ] T615 Modificar [src/routes/AppRoutes.tsx](../../src/routes/AppRoutes.tsx) — remover la ruta `/portal` y su import. Si alguien navega a `/portal`, cae en el `*` → NotFoundPage. Aceptable.
- [ ] T616 Verificar que ningún `navigate("/portal")` o `<Link to="/portal">` quedó vivo en el codebase. `grep -r "/portal" src/`.

---

## Fase 5 — Strict mode definitivo

- [ ] T617 [tsconfig.app.json](../../tsconfig.app.json) — confirmar `strict: true`. Si por T008 quedó en `false`, activar.
- [ ] T618 `npx tsc --noEmit` y resolver errores remanentes:
  - `noImplicitAny`: tipar `any` explícitos
  - `strictNullChecks`: agregar guards `?` o `!`
  - `noImplicitThis`: solo en clases — improbable
- [ ] T619 Si algún error requiere refactor mayor (>50 líneas), documentar inline con un `// FIXME PLAN-06 strict`. Idealmente cerrar todo aquí, pero deja el escape de seguridad.

---

## Fase 6 — Limpieza de `// TODO PLAN-XX`

- [ ] T620 Cerrar el TODO de re-habilitar rutas en `AdminVehiculoDetallePage` (PLAN-04 T430 — debería estar resuelto).
- [ ] T621 Cerrar TODOs en mappers donde decía `// peso: 0 — backend no lo expone` (PLAN-04 T408): si el backend ahora lo expone (T402 PLAN-04 ya verificó), conectar; si no, mantener `0` y eliminar el TODO (es una limitación aceptada del modelo backend, no una deuda).
- [ ] T622 Cerrar TODO de `ciudad: "—"` en mapper de ruta: definir si el modelo unificado de zona se queda como un solo string o si se separa. Si se queda unificado, eliminar el campo `ciudad` de `Ruta` UI (cambio de tipos + JSX que muestre solo `zona`).
- [ ] T623 Cerrar cualquier otro `// TODO PLAN-XX` listado en T602.

---

## Fase 7 — Tests E2E mínimos con MSW + Testing Library

- [ ] T624 Instalar `msw`:

```bash
npm install -D msw
```

- [ ] T625 Crear `src/test/mocks/handlers.ts` con handlers para los endpoints clave:

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/auth/login", () =>
    HttpResponse.json({
      token: "fake-jwt",
      tokenType: "Bearer",
      user: { id: "u1", email: "test@test.com", nombre: "Test User", rol: "FLEET_ADMIN" },
    }),
  ),
  http.get("/api/vehiculos", () =>
    HttpResponse.json([
      {
        id: "v1",
        placa: "ABC-001",
        tipo: "MOTO",
        modelo: "AKT",
        capacidadPesoKg: 20,
        volumenMaximoM3: 0.3,
        zonaOperacion: "Zona Norte",
        estado: "DISPONIBLE",
        conductorId: null,
        createdAt: "2026-05-01T10:00:00Z",
        updatedAt: "2026-05-01T10:00:00Z",
      },
    ]),
  ),
  // ... handlers para conductores, rutas, conductor/ruta-activa, etc.
];
```

- [ ] T626 Crear `src/test/mocks/server.ts` con `setupServer(...handlers)`. Configurar en `src/test/setup.ts`:

```ts
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] T627 Test E2E `src/test/e2e/login-flow.test.tsx`:
  - Render de `<App />` en `MemoryRouter` con ruta inicial `/login`
  - Type email + password → click submit → espera redirección a `/admin`
  - Verifica que `localStorage["auth.token"]` está seteado

- [ ] T628 Test E2E `src/test/e2e/admin-registrar-vehiculo.test.tsx`:
  - Setup: token mockeado en localStorage
  - Render `/admin/registrar` → llenar form → click "Registrar vehículo"
  - Mock del POST retorna 201 → toast "Vehículo registrado" → navigate a `/admin`
  - Mock con 409 → toast de placa duplicada

- [ ] T629 Test E2E `src/test/e2e/conductor-registrar-parada.test.tsx`:
  - Mock de `/api/conductor/ruta-activa` con una ruta EN_TRANSITO + paradas
  - Render `/conductor/parada/<paqueteId>`
  - Click "Entrega Exitosa" → expand → simular foto upload (Blob mock) → confirmar
  - Verificar mock de POST resultado fue llamado con `urlFoto` y `fechaHoraAccion` ISO

- [ ] T630 `npm run test` pasa con los 3 tests + los unitarios de planes anteriores.

---

## Fase 8 — README del proyecto

- [ ] T631 Crear `README.md` en la raíz con:

````markdown
# LogisticsRoutes Frontend

SPA en React 18 + TypeScript + Vite que consume el backend Spring Boot del módulo 2 (Logistics Routes).

## Setup

Requiere Node.js ≥ 20 (ver `.nvmrc`).

```bash
nvm use            # opcional, si usas nvm
npm install
npm run dev        # http://localhost:5173, proxy /api → :8080
```
````

## Variables de entorno

Por default el frontend asume backend en `http://localhost:8080` vía proxy de Vite. En prod o si el backend está en otro host:

```bash
# .env.local
VITE_API_URL=https://api.logistics.example.com
```

## Scripts

| Script                 | Qué hace            |
| ---------------------- | ------------------- |
| `npm run dev`          | Dev server con HMR  |
| `npm run build`        | Build producción    |
| `npm run typecheck`    | `tsc --noEmit` (CI) |
| `npm run lint`         | ESLint              |
| `npm run lint:fix`     | ESLint + autofix    |
| `npm run format`       | Prettier (escribe)  |
| `npm run format:check` | Prettier (CI)       |
| `npm run test`         | Vitest run          |
| `npm run test:watch`   | Vitest watch        |

## Estructura

- `src/auth/` — AuthContext, ProtectedRoute, JWT
- `src/services/` — wrappers HTTP por dominio + mappers DTO↔UI
- `src/hooks/` — React Query hooks (un archivo por operación)
- `src/offline/` — IndexedDB queue + sync engine para el conductor (PWA)
- `src/lib/` — utilidades compartidas (queryKeys, formatters, constants)
- `src/types/` — tipos de dominio (UI) y DTOs del backend
- `src/pages/` — pantallas por rol
- `src/components/` — componentes compartidos + shadcn/ui

## Roles

- `FLEET_ADMIN` → `/admin`
- `DISPATCHER` → `/despachador`
- `DRIVER` → `/conductor`

## Documentación de planes

Los planes de implementación viven en [docs/plans/](docs/plans/). PLAN-00 a PLAN-06 son los sprints históricos del proyecto.

```

- [ ] T632 Verificar que el README se renderiza bien en GitHub (o equivalente) — sin enlaces rotos, ejemplos formateados.

---

## Fase 9 — Validación final

- [ ] T633 Smoke test manual de los 3 roles con backend levantado:
  1. Login como FLEET_ADMIN → registrar vehículo, asignar conductor, dar de baja vehículo
  2. Login como DISPATCHER → ver rutas, despacho manual, confirmar despacho, forzar cierre
  3. Login como DRIVER → iniciar tránsito, registrar parada online + offline, cerrar ruta
  4. Logout en cada rol → redirige a /login

- [ ] T634 `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test`, `npm run build` — todos pasan.

- [ ] T635 Inspeccionar el bundle final: `ls -lh dist/assets/`. Si algún chunk de JS supera ~500kB, considerar code-splitting por rol (`React.lazy` + `Suspense` en AppRoutes). Decisión inline: si pasa, agregar lazy loading; si no, dejar.

- [ ] T636 Confirmar que `grep -r "TODO PLAN" src/` retorna 0 resultados (todos los TODOs cerrados).

---

## ✅ Checkpoint 6 — Estado final del proyecto

- `mockData.ts` y `data/` eliminados. Todas las pantallas usan hooks contra el backend.
- Tipos UI = DTOs del backend (mismas constantes uppercase). Display traducido vía `*Label` en formatters.
- `PortalPage` y la ruta `/portal` eliminadas. Login redirige directo al home del rol; `Navbar.backTo` es dinámico.
- `strict: true` en TypeScript sin errores.
- Tests E2E para los 3 flujos críticos pasan (login, registrar vehículo, registrar parada offline).
- README documenta setup, scripts, estructura y roles.
- `grep -r "TODO PLAN" src/` retorna vacío.
- `npm run build` produce un bundle limpio sin warnings.

---

## Mejoras futuras (fuera de scope)

Documentadas para referencia. Cada una puede ser un PR aparte cuando el equipo lo priorice.

| Tema | Descripción |
|---|---|
| Firma del receptor con canvas | `react-signature-canvas` capturando trazo, persistir como Blob en IndexedDB y subir a S3 igual que la foto POD |
| WebSocket para alertas en tiempo real | Reemplazar el polling 30s + derivación client-side por suscripción WebSocket al backend |
| Migración a `react-hook-form` + `zod` | Refactor de los 4 forms admin para reducir boilerplate y centralizar validación |
| Íconos PWA PNG 192/512 | Diseñar y agregar al `manifest.webmanifest` para instalación pulida en Android |
| Compresión de fotos POD | Comprimir blob a 800px / 80% jpeg antes de IndexedDB para reducir uso de storage |
| E2E real con Playwright | Sustituir RTL+MSW por browser real, multi-tab, screenshots |
| Code splitting por rol | `React.lazy` + `Suspense` para que cada rol cargue solo su bundle |
| Internacionalización (i18n) | Si crece el alcance fuera de Colombia |

---

## Orden Total de Ejecución

```

Sprint 0 — Config inicial (PLAN-00)
└── Sprint 1 — Auth y rutas protegidas (PLAN-01)
└── Sprint 2 — Servicios + React Query (PLAN-02)
└── Sprint 3 — Admin de flota integrado (PLAN-03)
└── Sprint 4 — Despachador integrado (PLAN-04)
└── Sprint 5 — Conductor + offline + POD (PLAN-05)
└── Sprint 6 — Limpieza final (PLAN-06) ← Este archivo

```

```
