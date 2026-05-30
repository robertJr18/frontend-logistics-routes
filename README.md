# Logistics Routes — Frontend

Interfaz web para el sistema de gestión de rutas y entregas. Incluye tres módulos según el rol del usuario: Administrador de Flota, Despachador y Conductor.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + shadcn/ui (componentes Radix)
- **TanStack Query v5** (estado del servidor)
- **React Router v6** (enrutamiento por rol)
- **vite-plugin-pwa** + **Workbox** (PWA, modo offline)
- **idb** (IndexedDB para caché offline y cola de acciones)
- **Vitest** + **@testing-library/react** (tests)

## Requisitos

- Node 20+
- Backend corriendo en `http://127.0.0.1:8080` (Spring Boot)

## Configuración

Crea un archivo `.env.local` en la raíz si necesitas apuntar a otro host del backend:

```env
VITE_API_PROXY_TARGET=http://127.0.0.1:8080
```

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo en http://localhost:5173
npm run build        # Build de producción
npm run preview      # Previsualizar build de producción
npm test             # Ejecutar tests (una vez)
npm run test:watch   # Tests en modo watch
npm run typecheck    # Verificar tipos TypeScript
npm run lint         # Linter ESLint
```

## Roles y rutas

| Rol          | Ruta base       | Descripción                              |
|--------------|-----------------|------------------------------------------|
| FLEET_ADMIN  | `/admin`        | Gestión de flota y conductores           |
| DISPATCHER   | `/despachador`  | Planificación y despacho de rutas        |
| DRIVER       | `/conductor`    | Gestión de paradas y entregas            |

El login redirige automáticamente al home del rol. Las rutas están protegidas con `ProtectedRoute`.

## Módulo conductor (offline-first)

El módulo `/conductor` funciona sin conexión:

- Las acciones (iniciar ruta, registrar parada, cerrar ruta) se encolan en IndexedDB cuando no hay red.
- Al recuperar conexión, el sync engine procesa la cola en orden y sincroniza con el backend.
- Las fotos de evidencia (POD) se almacenan en IndexedDB y se suben al sincronizar.
- La barra de estado (`SyncStatusBar`) indica el estado de sincronización en tiempo real.

## Estructura del código

```
src/
├── auth/           # Contexto de autenticación, ProtectedRoute, JWT
├── components/     # Componentes compartidos (Navbar, StatusBadge, SyncStatusBar…)
├── hooks/          # React Query hooks por dominio (conductor/, vehiculos/, rutas/…)
├── lib/            # Utilidades puras (formatters, db, syncEngine, syncQueue, zonas)
├── pages/          # Páginas por módulo (admin/, despachador/, conductor/, public/)
├── routes/         # AppRoutes.tsx
├── services/       # Clientes HTTP + mappers DTO → dominio
└── types/          # Tipos de dominio (domain.ts) y DTOs del backend (dto/)
```

## Tests

Los tests están junto al código que prueban (`*.test.ts` / `*.test.tsx`). Cubren:

- Mappers DTO → dominio (`services/mappers/`)
- Formateadores (`lib/formatters.test.ts`)
- Capa HTTP (`services/api.test.ts`, `services/auth.test.ts`)
- Contexto de autenticación y rutas protegidas (`auth/`)
- Lógica de alertas (`lib/alertas.test.ts`)

```bash
npm test
# 86 tests, 12 suites
```
