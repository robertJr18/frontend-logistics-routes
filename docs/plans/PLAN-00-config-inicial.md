# PLAN-00 — Configuración Inicial del Frontend

**Date:** 2026-05-05
**Alcance:** Sprint 0 del frontend. Prerequisito de todos los demás planes (auth, servicios, integración por rol).
**Backend pareado:** [PLAN-00-arquitectura-master.md](../../../backend/.../PLAN-00-arquitectura-master.md) — el backend ya está terminado y expone `http://localhost:8080`.

---

**Este plan NO toca código de pantallas ni introduce nuevas dependencias de runtime.** Solo configura tooling, scripts y archivos raíz. La arquitectura por capas (auth, services, hooks, mappers) la define PLAN-01 en adelante.

---

## Decisiones de Configuración

### 1. Dev server en puerto 5173

[vite.config.ts](../../vite.config.ts) actualmente usa `port: 8080`, **mismo puerto que el backend Spring Boot**. Levantar ambos en local es imposible.

**Decisión:** mover el frontend a `5173` (default de Vite). El backend conserva `8080`.

### 2. Proxy de Vite hacia el backend

`VITE_API_URL` apuntando a `http://localhost:8080` funciona, pero genera problemas de CORS y obliga al backend a configurar `@CrossOrigin`. Mejor:

**Decisión:** en `vite.config.ts` agregar `server.proxy: { "/api": "http://localhost:8080" }`. Las llamadas usan paths relativos `/api/...` y Vite los reenvía. En producción, las apps van detrás del mismo dominio o usan `VITE_API_URL` real.

`src/services/api.ts` debe leer `import.meta.env.VITE_API_URL ?? ""` (string vacío → relativo, usa proxy en dev).

### 3. TypeScript estricto

[tsconfig.json](../../tsconfig.json) y [tsconfig.app.json](../../tsconfig.app.json) tienen:

- `strict: false`
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

**Por qué importa ahora:** el backend usa `@Valid` + DTOs tipados y devuelve `null` en muchos campos opcionales (`conductorAsignado`, `motivoNovedad`, `fechaHoraGestion`). Sin `strictNullChecks` el compilador no nos avisa cuando accedemos a un nullable que no chequeamos.

**Decisión:** activar `strict: true` y `noUnusedLocals/Parameters: "warn"` en `tsconfig.app.json`. Si aparecen errores en código existente del compañero, **se documentan** en una lista de "deuda de estricto" y se corrigen plan por plan junto con la integración (no en este sprint).

### 4. ESLint endurecido + Prettier

[eslint.config.js](../../eslint.config.js) tiene `@typescript-eslint/no-unused-vars: "off"`. Esto enmascara imports y variables muertas del prototipo.

**Decisión:** cambiar a `"warn"` con `argsIgnorePattern: "^_"` (permitir `_unused`). Agregar Prettier (`prettier`, `eslint-config-prettier`) y un `.prettierrc` mínimo. Sin Husky ni lint-staged en este sprint — se evalúa después si hace falta.

### 5. Variables de entorno tipadas

Hoy `import.meta.env.VITE_API_URL` no está tipado, vuelve `string | undefined`. Al crecer las env vars (token storage key, endpoint de S3 presigned, feature flags) esto se complica.

**Decisión:** crear `src/env.d.ts` con un `interface ImportMetaEnv` que declare todas las VITE\_\*. Mantener `.env.example` como fuente de verdad de qué necesita el equipo.

### 6. Versión de Node fijada

Sin `.nvmrc` ni campo `engines` en `package.json`, cada integrante puede correr una Node distinta. El compañero pudo haber usado Node 22 con features que en Node 18 no compilan.

**Decisión:** agregar `.nvmrc` con `20.18.0` (LTS) y `engines: { "node": ">=20" }` en `package.json`.

### 7. Scripts de soporte

Faltan scripts de uso diario:

- `typecheck` — `tsc --noEmit` (integra en CI sin compilar).
- `format` y `format:check` — Prettier.
- `lint:fix`.

### 8. Limpieza de configs heredadas de Lovable

El proyecto fue iniciado con Lovable y arrastra restos:

- [tailwind.config.ts](../../tailwind.config.ts:6) tiene `content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"]` — solo `./src/**` aplica acá (no es Next.js). Los otros tres son ruido inerte que el cazador de purga revisa innecesariamente.
- [tsconfig.app.json](../../tsconfig.app.json) declara `types: ["vitest/globals"]`. Vitest ya está en `vitest.config.ts` con `globals: true`. Mantenerlo es correcto, no hay que tocarlo.

---

## Estado actual (delta a aplicar)

| Archivo                                               | Estado                                     | Acción                                                  |
| ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| [package.json](../../package.json)                    | Sin `engines`, sin `typecheck`/`format`    | Agregar `engines.node`, scripts                         |
| [vite.config.ts](../../vite.config.ts)                | Puerto 8080, sin proxy                     | Cambiar a 5173, agregar proxy `/api`                    |
| [tsconfig.json](../../tsconfig.json)                  | `strict: false`, redundante                | Limpiar; las opciones reales viven en los referenciados |
| [tsconfig.app.json](../../tsconfig.app.json)          | `strict: false`, `strictNullChecks: false` | Activar `strict: true`                                  |
| [eslint.config.js](../../eslint.config.js)            | `no-unused-vars: "off"`                    | Cambiar a `"warn"` con `argsIgnorePattern`              |
| [tailwind.config.ts](../../tailwind.config.ts)        | `content` con paths Next.js                | Dejar solo `./src/**/*.{ts,tsx}`                        |
| [.env.example](../../.env.example)                    | Apunta a `http://localhost:8080`           | Documentar como override; default vacío con proxy       |
| `src/env.d.ts`                                        | No existe                                  | Crear con tipos de `ImportMetaEnv`                      |
| `.prettierrc`                                         | No existe                                  | Crear                                                   |
| `.prettierignore`                                     | No existe                                  | Crear                                                   |
| `.nvmrc`                                              | No existe                                  | Crear con `20.18.0`                                     |
| [src/services/api.ts:1](../../src/services/api.ts#L1) | `?? "http://localhost:8080"`               | `?? ""` (relativo, usa proxy)                           |

---

## Fase 0 — Tareas

### F0.1 — Dev server y proxy

- [ ] T001 [vite.config.ts](../../vite.config.ts): cambiar `server.port` de `8080` → `5173`. Mantener `host: "::"` y `hmr.overlay: false`.
- [ ] T002 [vite.config.ts](../../vite.config.ts): agregar `server.proxy`:

```ts
server: {
  host: "::",
  port: 5173,
  hmr: { overlay: false },
  proxy: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
    },
  },
},
```

- [ ] T003 [src/services/api.ts:1](../../src/services/api.ts#L1): cambiar `const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";` → `const API_URL = import.meta.env.VITE_API_URL ?? "";`. En dev queda relativo y pasa por el proxy; en prod se setea `VITE_API_URL`.
- [ ] T004 [.env.example](../../.env.example): dejar como override opcional. Documentar arriba con un comentario:

```
# Solo necesario si el frontend NO usa el proxy de Vite (prod o dev contra otro host).
# En dev local con backend en :8080, dejar vacío.
# VITE_API_URL=
```

### F0.2 — TypeScript estricto

- [ ] T005 [tsconfig.app.json](../../tsconfig.app.json): activar `strict: true`. Eliminar `strictNullChecks: false`, `noImplicitAny: false`. Mantener `noUnusedLocals: false`, `noUnusedParameters: false` (eso lo gobierna ESLint).
- [ ] T006 [tsconfig.json](../../tsconfig.json) (root): quitar `compilerOptions` redundantes; los referenciados ya las tienen. Dejar solo:

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
```

- [ ] T007 Crear `src/env.d.ts` con tipos de las env vars del proyecto:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] T008 Correr `npm run build` y `npx tsc --noEmit`. Capturar la lista de errores que aparezcan al activar `strict`. **No corregirlos en este sprint** — quedan como deuda documentada en [docs/plans/DEUDA-strict-mode.md](DEUDA-strict-mode.md), a resolver junto con las pantallas en PLAN-03/04/05. Mientras tanto, si el build queda roto, considerar:
  - Activar `strict: true` solo cuando empiece PLAN-01, **o**
  - Mantener `strict: true` pero con `// @ts-expect-error` puntuales en el prototipo del compañero, removidos plan por plan.
  - **Decisión durante T008** según volumen de errores.

### F0.3 — ESLint y Prettier

- [ ] T009 [eslint.config.js](../../eslint.config.js): cambiar la regla:

```js
"@typescript-eslint/no-unused-vars": [
  "warn",
  { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
],
```

- [ ] T010 Instalar Prettier:

```bash
npm install -D prettier eslint-config-prettier
```

- [ ] T011 Crear `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

- [ ] T012 Crear `.prettierignore`:

```
node_modules
dist
dist-ssr
build
coverage
*.min.js
package-lock.json
src/components/ui/
```

> **Nota:** ignoramos `src/components/ui/` porque son componentes shadcn generados y no deberían reformatearse manualmente — su formato lo controla la CLI de shadcn.

- [ ] T013 [eslint.config.js](../../eslint.config.js): agregar `prettier` al final de `extends` para que ESLint no pelee con Prettier:

```js
import prettierConfig from "eslint-config-prettier";
// ...
extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
```

### F0.4 — Scripts y versión de Node

- [ ] T014 [package.json](../../package.json): agregar scripts y `engines`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] T015 Crear `.nvmrc`:

```
20.18.0
```

### F0.5 — Limpieza tailwind

- [ ] T016 [tailwind.config.ts:6](../../tailwind.config.ts#L6): reemplazar `content` por:

```ts
content: ["./src/**/*.{ts,tsx}", "./index.html"],
```

> **Por qué `./index.html`:** Tailwind purga clases que solo aparecen en HTML (raras en este proyecto, pero es la convención de Vite + Tailwind y evita falsos negativos a futuro).

### F0.6 — Validación

- [ ] T017 `npm install` desde cero (descarta `node_modules`, regenera `package-lock.json`).
- [ ] T018 Levantar el backend en `:8080` y `npm run dev`. Verificar:
  - Frontend abre en `http://localhost:5173`.
  - Una llamada manual desde DevTools `fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })` llega al backend (debería responder `400` por payload vacío, no `404` ni CORS).
- [ ] T019 `npm run lint` pasa (warnings permitidos, sin errores).
- [ ] T020 `npm run typecheck` pasa (o, si se decidió diferir `strict`, queda documentado en DEUDA-strict-mode.md).
- [ ] T021 `npm run format:check` pasa (correr `npm run format` primero — habrá ajustes en archivos del compañero).

---

## ✅ Checkpoint 0

- Dev server arranca en `:5173` y proxa `/api` al backend en `:8080`.
- TypeScript en modo `strict` (o decidido diferir con plan documentado).
- Lint y format consistentes en todo el repo.
- Versión de Node fija para el equipo.
- Scripts `dev`, `build`, `lint`, `typecheck`, `format`, `test` funcionando.
- **No se ha tocado ninguna pantalla, hook, ni dependencia de runtime.**

---

## Orden Total de Ejecución

```
Sprint 0 — Config inicial (PLAN-00)        ← Este archivo
    └── Sprint 1 — Auth y rutas protegidas (PLAN-01)
            └── Sprint 2 — Servicios + React Query (PLAN-02)
                    └── Sprint 3 — Admin de flota integrado (PLAN-03)
                            └── Sprint 4 — Despachador integrado (PLAN-04)
                                    └── Sprint 5 — Conductor + offline + POD (PLAN-05)
                                            └── Sprint 6 — Limpieza final (PLAN-06)
```
