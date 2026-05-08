# PLAN-05 — Conductor + Offline + POD

**Date:** 2026-05-05
**Sprint:** 5 (depende de PLAN-04)
**Backend pareado:** PLAN-04 backend (`ConductorOperacionController`, T414). Especificaciones: SPEC-06, SPEC-07. Eventos: SPEC-08 (1, 3, 4, 5, 6, 7, 8).

---

## Summary

Reemplazar `mockData` en las 3 pantallas del conductor (lista de paradas, gestión de parada, cierre de ruta) con queries y mutaciones contra el backend, **agregando soporte offline-first**. El conductor opera en campo con conectividad intermitente: SPEC-06/07 exigen que la ruta esté disponible offline desde el despacho, que las acciones se registren con el timestamp real (no de sincronización) y que ningún registro se pierda al reconectar. Esto implica:

- PWA con service worker (cache del app shell para que la app cargue offline).
- IndexedDB como cola de mutaciones pendientes y cache de la ruta activa.
- Subida de fotos POD a S3 vía endpoint dedicado del backend, con almacenamiento del blob localmente cuando se está offline.
- Detección de online/offline + drain automático de la cola al reconectar.
- Indicador visible al conductor del estado de sincronización.

**Este es el plan más extenso.** Si en la ejecución se ve que offline + PWA infla demasiado el sprint, se puede partir en dos PRs (uno para integración online + POD, otro para offline + service worker).

---

## Decisiones

### 1. Offline-first, no online-first

**Decisión:** las acciones del conductor (registrar parada, cerrar ruta) se escriben **primero en IndexedDB local** y luego se intentan sincronizar con el backend. Si está online, el sync es prácticamente inmediato; si está offline, el registro queda en la cola hasta reconectar.

**Por qué:** la operación en campo no puede esperar respuesta de red para confirmar al usuario. Online-first (intentar API → si falla, queue) genera fricción visible. Offline-first (siempre escribir local) hace que la app se sienta instantánea y robusta.

### 2. `idb-keyval` para IndexedDB (no Dexie)

**Decisión:** instalar `idb-keyval` (~700 bytes). Usamos solo dos almacenes:

- Una key `conductor.rutaActiva` con el snapshot del último GET ruta-activa.
- Una key `conductor.queue` con un array de mutaciones pendientes (orden FIFO).

**Por qué:** Dexie pesa ~30kB y aporta queries/índices que no necesitamos. `idb-keyval` cubre el patrón key-value que basta para esto.

### 3. PWA mínima con `vite-plugin-pwa`

**Decisión:** instalar `vite-plugin-pwa` con preset `autoUpdate`. Genera service worker via Workbox que cachea el app shell (HTML/JS/CSS/iconos). **Sin caching de respuestas API** — esa lógica vive en IndexedDB con control explícito.

`manifest.webmanifest` con: `name: "LogisticsRoutes"`, `display: "standalone"`, ícono mínimo (placeholder hasta que diseño dé uno). La app debe ser instalable desde Chrome/Android pero sin meta-trabajo de iOS por ahora.

**Sin esto el conductor no puede abrir la app offline.** Es prerrequisito para el resto del plan.

### 4. POD: blob local primero, upload en sync

**Decisión flujo POD:**

1. Conductor toma foto → blob en memoria.
2. UI guarda el blob en IndexedDB asociado al `paradaId` (key: `pod.<paradaId>.foto`).
3. Frontend genera un placeholder URL (`local://pod/<paradaId>`) y arma el comando `RegistrarParadaCommand` con ese URL placeholder.
4. Comando va a la cola de sync.
5. Cuando el sync engine procesa el comando: detecta URL `local://`, toma el blob, sube a `POST /api/conductor/paradas/{paradaId}/foto` (multipart), recibe URL real de S3, y entonces sí llama `POST /api/conductor/rutas/{rutaId}/paradas/{paqueteId}/resultado` con la URL real.
6. Después del éxito, borra el blob local.

**Por qué:** los blobs de fotos pueden ser 2–5MB. Mantenerlos en memoria entre toma y sync es frágil (si la app se cierra el blob se pierde). IndexedDB persiste binarios sin problema.

> T501 verifica que el endpoint `POST /api/conductor/paradas/{paradaId}/foto` existe y retorna `{ url: "https://s3..." }`. Si el flujo del backend es distinto (presigned PUT directo a S3), ajustar el sync engine.

### 5. `fechaHoraAccion` capturada al momento del clic, no del sync

**Decisión:** cuando el conductor confirma una parada, el frontend captura `new Date().toISOString()` en ese instante. Ese valor se guarda en la cola y se envía al backend tal cual (no se reemplaza por `now()` en el sync). El backend lo usa como `fechaHoraGestion`.

**Por qué:** SPEC-06 SC-016 y SPEC-07 SC-020 lo exigen — el timestamp debe reflejar cuándo el conductor ejecutó la acción, no cuándo se sincronizó.

### 6. Optimistic UI: la parada se marca local antes del sync

**Decisión:** al confirmar una parada, la UI cambia inmediatamente el estado de la parada local (verde/rojo/naranja) sin esperar respuesta. React Query con `onMutate` para optimistic update. Si el sync falla con 4xx (el backend rechaza), revertir y mostrar toast de error. Si falla con error de red, queda en cola y el cambio local se mantiene (eventualmente se sincroniza).

### 7. Identificación del conductor: backend resuelve desde JWT

**Decisión:** el endpoint `GET /api/conductor/ruta-activa` no recibe `conductorId` — el backend lo resuelve del JWT (per [PLAN-04 backend T414](../../../docs/plans/PLAN-04-operacion-campo.md#T414)). El frontend solo debe asegurar que el header `Authorization` se inyecte (PLAN-02 ya lo hace).

### 8. Detección de online: `navigator.onLine` + heartbeat

**Decisión:**

- `navigator.onLine` y los eventos `online`/`offline` del browser como base.
- Heartbeat opcional cada 60s: `HEAD /api/health` (Spring Actuator). Si falla 3 veces consecutivas → marcamos `offline` aunque `navigator.onLine === true` (cubre el caso de WiFi conectado pero sin internet).
- Hook `useNetworkStatus()` expone `{ online: boolean, lastSync: Date | null, queueSize: number }`.

### 9. Sync engine: drain serial al reconectar

**Decisión:** al detectar transición offline → online, drenar la cola en orden FIFO. Cada mutación se procesa secuencialmente (no en paralelo) para mantener orden temporal. Si falla por 5xx o red → detener drain, esperar próximo evento online. Si falla por 4xx (validación) → eliminar de cola, log el error, mostrar toast tipo "No se pudo sincronizar la parada X — contacta al despachador".

Drain también se dispara:

- Al cargar la app (por si quedaron pendientes de sesión anterior).
- Manualmente con botón "Sincronizar ahora".

### 10. Hardcoded R-2049 desaparece

[ConductorPage.tsx:9](../../src/pages/conductor/ConductorPage.tsx#L9), [ConductorParadaPage.tsx:24](../../src/pages/conductor/ConductorParadaPage.tsx#L24), [ConductorCierrePage.tsx:9](../../src/pages/conductor/ConductorCierrePage.tsx#L9) — todas leen `rutas.find(r => r.id === "R-2049")`.

**Decisión:** todas usan `useRutaActiva()` (sin parámetros — el backend resuelve desde JWT). Si el conductor no tiene ruta asignada → mostrar pantalla "No tienes ruta activa" en lugar del hardcoded.

### 11. Cierre con `confirmarConPendientes`

[ConductorCierrePage.tsx:16-22](../../src/pages/conductor/ConductorCierrePage.tsx#L16-L22) llama un `handleClose` mock. El backend pide `{ confirmarConPendientes: boolean }`.

**Decisión:** el botón "Confirmar cierre de ruta" envía `{ confirmarConPendientes: paradasPendientes > 0 }`. Si hay pendientes y el backend retorna 409 (caso edge race), mostrar toast con la lista de pendientes que vino en `error.body`.

---

## Estado actual (delta a aplicar)

| Archivo                                                                             | Estado                                  | Acción                                                                              |
| ----------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| [ConductorPage.tsx:9](../../src/pages/conductor/ConductorPage.tsx#L9)               | Hardcoded R-2049                        | `useRutaActiva()`. Confirmar inicio de tránsito vía `useIniciarTransito()`.         |
| [ConductorParadaPage.tsx:24](../../src/pages/conductor/ConductorParadaPage.tsx#L24) | Hardcoded R-2049, mock confirm          | `useRutaActiva()` + `useRegistrarParada()`. POD upload con blob → IndexedDB → sync. |
| [ConductorCierrePage.tsx:9](../../src/pages/conductor/ConductorCierrePage.tsx#L9)   | Hardcoded R-2049, mock close            | `useRutaActiva()` + `useCerrarRuta()`.                                              |
| [vite.config.ts](../../vite.config.ts)                                              | Sin PWA                                 | Agregar plugin `vite-plugin-pwa`                                                    |
| [src/auth/AuthContext.tsx](../../src/auth/AuthContext.tsx)                          | (PLAN-01)                               | Trigger drain al login                                                              |
| [src/App.tsx](../../src/App.tsx)                                                    | (PLAN-02)                               | Montar `<SyncProvider>` arriba de `<AppRoutes />`                                   |
| `package.json`                                                                      | Sin `idb-keyval`, sin `vite-plugin-pwa` | Agregar                                                                             |
| Nuevos archivos                                                                     | —                                       | Service, mappers, hooks, IndexedDB, sync engine, UI indicador (ver estructura)      |

---

## Estructura de archivos nuevos

```
src/
├── types/dto/
│   └── conductor-operacion.ts          [NUEVO]
├── services/
│   ├── conductor-operacion.ts          [NUEVO]  ← getRutaActiva, iniciarTransito, registrarParada, cerrarRuta, uploadFoto
│   └── mappers/
│       └── ruta-conductor.ts           [NUEVO]
├── offline/
│   ├── db.ts                           [NUEVO]  ← wrapper idb-keyval con keys tipadas
│   ├── queue.ts                        [NUEVO]  ← enqueue, dequeue, peek, clear
│   ├── pod-storage.ts                  [NUEVO]  ← saveBlob, getBlob, deleteBlob
│   ├── sync-engine.ts                  [NUEVO]  ← drain(), resuelve POD URLs antes de mutaciones
│   ├── network.ts                      [NUEVO]  ← navigator.onLine + heartbeat
│   └── SyncProvider.tsx                [NUEVO]  ← Context + listener online/offline + auto-drain
├── hooks/
│   ├── conductor/
│   │   ├── useRutaActiva.ts            [NUEVO]
│   │   ├── useIniciarTransito.ts       [NUEVO]
│   │   ├── useRegistrarParada.ts       [NUEVO]  ← offline-aware
│   │   └── useCerrarRuta.ts            [NUEVO]  ← offline-aware
│   └── useNetworkStatus.ts             [NUEVO]
├── components/
│   └── conductor/
│       ├── SyncBadge.tsx               [NUEVO]  ← muestra online/offline + queueSize
│       └── PendientesBanner.tsx        [NUEVO]  ← warning si hay pendientes en cola
└── lib/queryKeys.ts                    [MODIFICAR] ← agregar `conductor.rutaActiva`
```

---

## Fase 1 — Prerequisitos y verificación de contratos

- [ ] T501 Verificar contratos del backend con token `DRIVER`:
  - `GET /api/conductor/ruta-activa` — shape de respuesta cuando hay ruta vs cuando no hay (¿204? ¿200 con null?)
  - `POST /api/conductor/rutas/{id}/iniciar-transito` — body, response
  - `POST /api/conductor/rutas/{id}/paradas/{paqueteId}/resultado` — body completo (resultado, motivoNovedad, urlFoto, urlFirma, nombreReceptor, fechaHoraAccion)
  - `POST /api/conductor/rutas/{id}/cerrar` — body `{ confirmarConPendientes }`, error 409 cuando hay pendientes y `false`
  - `POST /api/conductor/paradas/{paradaId}/foto` — multipart, response shape (¿`{ url }` o presigned PUT?)
- [ ] T502 Verificar que PLAN-04 está cerrado: el despachador puede confirmar despachos y los conductores ven rutas reales asignadas en backend.

---

## Fase 2 — Dependencias e integración PWA

- [ ] T503 Instalar dependencias:

```bash
npm install idb-keyval
npm install -D vite-plugin-pwa
```

- [ ] T504 Modificar [vite.config.ts](../../vite.config.ts) — agregar plugin PWA:

```ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // ...
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "LogisticsRoutes",
        short_name: "Logistics",
        description: "Plataforma de planificación de rutas y gestión de flota",
        theme_color: "#0E1736",
        background_color: "#0E1736",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "favicon.svg", sizes: "any", type: "image/svg+xml" },
          // PLAN-06 agrega íconos PNG 192/512 si diseño los entrega
        ],
      },
      workbox: {
        // SOLO cachear assets estáticos. Las llamadas /api/* SIEMPRE van a red.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
```

- [ ] T505 `npm run build` y verificar que `dist/` contiene `sw.js`, `workbox-*.js`, y `manifest.webmanifest`. Hacer `npm run preview` y abrir DevTools → Application → Service Workers para confirmar que se registra.

---

## Fase 3 — DTOs y service del conductor

- [ ] T506 Crear [src/types/dto/conductor-operacion.ts](../../src/types/dto/conductor-operacion.ts):

```ts
import type { RutaResponse } from "./ruta";
import type { MotivoNovedadDto } from "./parada";

export type ResultadoParadaDto = "EXITOSA" | "FALLIDA" | "NOVEDAD";

export interface RegistrarParadaRequest {
  paqueteId: string;
  resultado: ResultadoParadaDto;
  motivoNovedad?: MotivoNovedadDto;
  urlFoto?: string;
  urlFirma?: string;
  nombreReceptor?: string;
  fechaHoraAccion: string; // ISO 8601 — capturado en cliente
}

export interface CerrarRutaRequest {
  confirmarConPendientes: boolean;
}

export interface FotoUploadResponse {
  url: string;
}

// La ruta activa puede ser null si el conductor no tiene una asignada
export type RutaActivaResponse = RutaResponse | null;
```

- [ ] T507 Crear [src/services/conductor-operacion.ts](../../src/services/conductor-operacion.ts):

```ts
import { api } from "./api";
import type {
  CerrarRutaRequest,
  FotoUploadResponse,
  RegistrarParadaRequest,
  RutaActivaResponse,
} from "@/types/dto/conductor-operacion";

export const conductorOperacionService = {
  rutaActiva: () => api.get<RutaActivaResponse>("/api/conductor/ruta-activa"),
  iniciarTransito: (rutaId: string) =>
    api.post<void>(`/api/conductor/rutas/${rutaId}/iniciar-transito`),
  registrarParada: (rutaId: string, req: RegistrarParadaRequest) =>
    api.post<void>(`/api/conductor/rutas/${rutaId}/paradas/${req.paqueteId}/resultado`, req),
  cerrarRuta: (rutaId: string, req: CerrarRutaRequest) =>
    api.post<void>(`/api/conductor/rutas/${rutaId}/cerrar`, req),
  uploadFoto: async (paradaId: string, blob: Blob): Promise<FotoUploadResponse> => {
    const form = new FormData();
    form.append("foto", blob, `${paradaId}.jpg`);
    // api.ts pone Content-Type: application/json por default — esto rompe multipart.
    // Llamada directa con fetch para no infectar api.ts:
    const token = localStorage.getItem("auth.token");
    const res = await fetch(`/api/conductor/paradas/${paradaId}/foto`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },
};
```

> **Nota:** la subida multipart no pasa por el wrapper `api` porque éste fija `Content-Type: application/json`. Llamada directa con fetch. Si crece la lógica multipart (otras pantallas), se refactoriza en PLAN-06.

- [ ] T508 Crear [src/services/mappers/ruta-conductor.ts](../../src/services/mappers/ruta-conductor.ts) — análogo a `mappers/ruta.ts` (PLAN-04) pero más enfocado a la vista del conductor (necesita peso, dirección, paqueteId por parada).

---

## Fase 4 — IndexedDB layer

- [ ] T509 Crear [src/offline/db.ts](../../src/offline/db.ts):

```ts
import { get, set, del } from "idb-keyval";

const KEYS = {
  RUTA_ACTIVA: "conductor.rutaActiva",
  QUEUE: "conductor.queue",
  POD_BLOB: (paradaId: string) => `pod.${paradaId}.foto` as const,
};

export const db = {
  getRutaActiva: () => get(KEYS.RUTA_ACTIVA),
  setRutaActiva: (data: unknown) => set(KEYS.RUTA_ACTIVA, data),
  clearRutaActiva: () => del(KEYS.RUTA_ACTIVA),

  getQueue: <T = unknown>() => get(KEYS.QUEUE).then((v): T[] => v ?? []),
  setQueue: <T = unknown>(items: T[]) => set(KEYS.QUEUE, items),

  saveBlob: (paradaId: string, blob: Blob) => set(KEYS.POD_BLOB(paradaId), blob),
  getBlob: (paradaId: string): Promise<Blob | undefined> => get(KEYS.POD_BLOB(paradaId)),
  deleteBlob: (paradaId: string) => del(KEYS.POD_BLOB(paradaId)),
};
```

- [ ] T510 Crear [src/offline/queue.ts](../../src/offline/queue.ts):

```ts
import { db } from "./db";

export type PendingMutation =
  | {
      kind: "iniciarTransito";
      rutaId: string;
      enqueuedAt: string;
    }
  | {
      kind: "registrarParada";
      rutaId: string;
      paqueteId: string;
      paradaId: string;
      payload: import("@/types/dto/conductor-operacion").RegistrarParadaRequest;
      podLocal?: boolean; // si urlFoto empieza con "local://"
      enqueuedAt: string;
    }
  | {
      kind: "cerrarRuta";
      rutaId: string;
      payload: import("@/types/dto/conductor-operacion").CerrarRutaRequest;
      enqueuedAt: string;
    };

export async function enqueue(m: PendingMutation): Promise<void> {
  const queue = await db.getQueue<PendingMutation>();
  queue.push(m);
  await db.setQueue(queue);
}

export async function peek(): Promise<PendingMutation | null> {
  const queue = await db.getQueue<PendingMutation>();
  return queue[0] ?? null;
}

export async function dequeue(): Promise<void> {
  const queue = await db.getQueue<PendingMutation>();
  queue.shift();
  await db.setQueue(queue);
}

export async function size(): Promise<number> {
  const queue = await db.getQueue<PendingMutation>();
  return queue.length;
}
```

- [ ] T511 Tests `src/offline/queue.test.ts` con `fake-indexeddb` (instalar como devDep):
  - enqueue + peek devuelve el mismo item
  - enqueue varios + dequeue mantiene FIFO
  - size correcto

---

## Fase 5 — Sync engine

- [ ] T512 Crear [src/offline/network.ts](../../src/offline/network.ts):

```ts
export async function pingBackend(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}
```

- [ ] T513 Crear [src/offline/sync-engine.ts](../../src/offline/sync-engine.ts):

```ts
import { peek, dequeue, size } from "./queue";
import { db } from "./db";
import { conductorOperacionService } from "@/services/conductor-operacion";
import { ApiError } from "@/services/api";

let draining = false;

export async function drain(onProgress?: (remaining: number) => void): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (true) {
      const next = await peek();
      if (!next) break;

      try {
        if (next.kind === "iniciarTransito") {
          await conductorOperacionService.iniciarTransito(next.rutaId);
        } else if (next.kind === "registrarParada") {
          let payload = next.payload;
          // Resolver POD local antes del registro
          if (next.podLocal && payload.urlFoto?.startsWith("local://")) {
            const blob = await db.getBlob(next.paradaId);
            if (!blob) throw new Error(`Blob POD perdido para parada ${next.paradaId}`);
            const { url } = await conductorOperacionService.uploadFoto(next.paradaId, blob);
            payload = { ...payload, urlFoto: url };
          }
          await conductorOperacionService.registrarParada(next.rutaId, payload);
          if (next.podLocal) await db.deleteBlob(next.paradaId);
        } else if (next.kind === "cerrarRuta") {
          await conductorOperacionService.cerrarRuta(next.rutaId, next.payload);
        }
        await dequeue();
        onProgress?.(await size());
      } catch (err) {
        if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
          // Validación rechazada por backend → eliminar y log
          console.error("Mutación rechazada por backend, descartando:", next, err);
          await dequeue();
          // TODO: notificar al usuario via toast (eventBus o similar)
          continue;
        }
        // Red u 5xx → detener drain, reintentar al próximo evento online
        throw err;
      }
    }
  } finally {
    draining = false;
  }
}
```

- [ ] T514 Crear [src/offline/SyncProvider.tsx](../../src/offline/SyncProvider.tsx):

```tsx
import { createContext, ReactNode, useEffect, useState } from "react";
import { drain } from "./sync-engine";
import { size } from "./queue";
import { isOnline, pingBackend } from "./network";

interface SyncContextValue {
  online: boolean;
  queueSize: number;
  lastSync: Date | null;
  syncNow: () => Promise<void>;
}

export const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(isOnline());
  const [queueSize, setQueueSize] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const refreshQueueSize = async () => setQueueSize(await size());

  const syncNow = async () => {
    try {
      await drain(setQueueSize);
      setLastSync(new Date());
    } catch (err) {
      console.warn("Sync incompleto:", err);
    }
    await refreshQueueSize();
  };

  useEffect(() => {
    refreshQueueSize();
    const goOnline = async () => {
      const real = await pingBackend();
      setOnline(real);
      if (real) syncNow();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Drain inicial al montar (puede haber pendientes de sesión anterior)
    if (isOnline()) syncNow();

    // Heartbeat cada 60s si parecemos online (cubre WiFi sin internet)
    const heartbeat = setInterval(async () => {
      if (navigator.onLine) {
        const real = await pingBackend();
        setOnline(real);
      } else {
        setOnline(false);
      }
    }, 60_000);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearInterval(heartbeat);
    };
  }, []);

  return (
    <SyncContext.Provider value={{ online, queueSize, lastSync, syncNow }}>
      {children}
    </SyncContext.Provider>
  );
}
```

- [ ] T515 Crear [src/hooks/useNetworkStatus.ts](../../src/hooks/useNetworkStatus.ts) — `useContext(SyncContext)` con verificación.

- [ ] T516 Modificar [src/App.tsx](../../src/App.tsx) — montar `<SyncProvider>` dentro del `<AuthProvider>`:

```tsx
<AuthProvider>
  <SyncProvider>
    <AppRoutes />
  </SyncProvider>
</AuthProvider>
```

---

## Fase 6 — Hooks del conductor (offline-aware)

- [ ] T517 [src/hooks/conductor/useRutaActiva.ts](../../src/hooks/conductor/useRutaActiva.ts):

```ts
import { useQuery } from "@tanstack/react-query";
import { conductorOperacionService } from "@/services/conductor-operacion";
import { db } from "@/offline/db";
import { toRuta } from "@/services/mappers/ruta";
import { queryKeys } from "@/lib/queryKeys";

export function useRutaActiva() {
  return useQuery({
    queryKey: queryKeys.conductor.rutaActiva(),
    queryFn: async () => {
      try {
        const dto = await conductorOperacionService.rutaActiva();
        if (dto) await db.setRutaActiva(dto);
        return dto ? toRuta(dto) : null;
      } catch (err) {
        // Sin red → leer cache local
        const cached = await db.getRutaActiva();
        if (cached) return toRuta(cached as never);
        throw err;
      }
    },
    staleTime: 60_000,
  });
}
```

- [ ] T518 [src/hooks/conductor/useIniciarTransito.ts](../../src/hooks/conductor/useIniciarTransito.ts) — encola la mutación, optimistic update del estado a "En Tránsito":

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enqueue } from "@/offline/queue";
import { drain } from "@/offline/sync-engine";
import { isOnline } from "@/offline/network";
import { queryKeys } from "@/lib/queryKeys";

export function useIniciarTransito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rutaId: string) => {
      await enqueue({ kind: "iniciarTransito", rutaId, enqueuedAt: new Date().toISOString() });
      if (isOnline()) await drain();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.conductor.rutaActiva() }),
  });
}
```

- [ ] T519 [src/hooks/conductor/useRegistrarParada.ts](../../src/hooks/conductor/useRegistrarParada.ts) — el más complejo:

```ts
export function useRegistrarParada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      rutaId: string;
      paqueteId: string;
      paradaId: string;
      resultado: ResultadoParadaDto;
      motivoNovedad?: MotivoNovedadDto;
      fotoBlob?: Blob;
      urlFirma?: string;
      nombreReceptor?: string;
    }) => {
      const fechaHoraAccion = new Date().toISOString();
      let urlFoto: string | undefined;
      let podLocal = false;

      if (input.fotoBlob) {
        if (isOnline()) {
          // Subir directo
          const { url } = await conductorOperacionService.uploadFoto(
            input.paradaId,
            input.fotoBlob,
          );
          urlFoto = url;
        } else {
          // Persistir blob, dejar URL placeholder
          await db.saveBlob(input.paradaId, input.fotoBlob);
          urlFoto = `local://${input.paradaId}`;
          podLocal = true;
        }
      }

      const payload: RegistrarParadaRequest = {
        paqueteId: input.paqueteId,
        resultado: input.resultado,
        motivoNovedad: input.motivoNovedad,
        urlFoto,
        urlFirma: input.urlFirma,
        nombreReceptor: input.nombreReceptor,
        fechaHoraAccion,
      };

      await enqueue({
        kind: "registrarParada",
        rutaId: input.rutaId,
        paqueteId: input.paqueteId,
        paradaId: input.paradaId,
        payload,
        podLocal,
        enqueuedAt: fechaHoraAccion,
      });

      if (isOnline()) await drain();
    },
    onMutate: async (input) => {
      // Optimistic update del estado local de la parada
      await qc.cancelQueries({ queryKey: queryKeys.conductor.rutaActiva() });
      const prev = qc.getQueryData(queryKeys.conductor.rutaActiva());
      qc.setQueryData(queryKeys.conductor.rutaActiva(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          paradas: old.paradas.map((p: any) =>
            p.paqueteId === input.paqueteId
              ? {
                  ...p,
                  status:
                    input.resultado === "EXITOSA"
                      ? "Exitosa"
                      : input.resultado === "FALLIDA"
                        ? "Fallida"
                        : "Novedad",
                }
              : p,
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.conductor.rutaActiva(), ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.conductor.rutaActiva() }),
  });
}
```

- [ ] T520 [src/hooks/conductor/useCerrarRuta.ts](../../src/hooks/conductor/useCerrarRuta.ts) — análogo pero con `kind: "cerrarRuta"`.

- [ ] T521 Actualizar [src/lib/queryKeys.ts](../../src/lib/queryKeys.ts) — agregar:

```ts
conductor: {
  all: ["conductor"] as const,
  rutaActiva: () => [...queryKeys.conductor.all, "rutaActiva"] as const,
},
```

---

## Fase 7 — Componentes UI de sincronización

- [ ] T522 [src/components/conductor/SyncBadge.tsx](../../src/components/conductor/SyncBadge.tsx):

```tsx
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export default function SyncBadge() {
  const { online, queueSize, syncNow, lastSync } = useNetworkStatus();
  return (
    <div className="flex items-center gap-2 text-xs">
      {online ? (
        <span className="flex items-center gap-1 text-[#4caf82]">
          <Wifi className="w-3 h-3" /> Online
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[#e05555]">
          <WifiOff className="w-3 h-3" /> Offline
        </span>
      )}
      {queueSize > 0 && (
        <button onClick={syncNow} className="flex items-center gap-1 text-primary">
          <RefreshCw className="w-3 h-3" /> {queueSize} pendiente{queueSize !== 1 ? "s" : ""}
        </button>
      )}
      {lastSync && online && queueSize === 0 && (
        <span className="text-white/40">Sync {lastSync.toLocaleTimeString()}</span>
      )}
    </div>
  );
}
```

- [ ] T523 [src/components/conductor/PendientesBanner.tsx](../../src/components/conductor/PendientesBanner.tsx) — banner amarillo arriba si `queueSize > 0`, con detalle expandible y botón "Sincronizar ahora".

---

## Fase 8 — Refactor de pantallas

### F8.1 — ConductorPage

- [ ] T524 [ConductorPage.tsx](../../src/pages/conductor/ConductorPage.tsx):
  - Eliminar `const ruta = rutas.find(r => r.id === "R-2049")!;`
  - `const { data: ruta, isLoading } = useRutaActiva();`
  - Si `!ruta`: pantalla "No tienes ruta activa asignada"
  - Header: agregar `<SyncBadge />` a la derecha
  - "Confirmar Inicio de Tránsito" → `useIniciarTransito().mutateAsync(ruta.id)` con loading state
  - "Cerrar ruta" navega a `/conductor/cierre` (sin cambios de routing)
  - El estado local `useState<"Confirmada" | "En Tránsito">` se elimina — el estado real viene de `ruta.estado`
  - Logout (T119 PLAN-01) ya está en línea 19

### F8.2 — ConductorParadaPage

- [ ] T525 [ConductorParadaPage.tsx](../../src/pages/conductor/ConductorParadaPage.tsx):
  - Eliminar hardcoded R-2049
  - `const { data: ruta } = useRutaActiva();`
  - El param `:id` actual es el `numero` de parada — cambiar a `paqueteId` (más estable y matchea backend). Actualizar [AppRoutes.tsx](../../src/routes/AppRoutes.tsx) y los `navigate(\`/conductor/parada/\${parada.paqueteId}\`)` en ConductorPage
  - Foto evidencia: agregar input `<input type="file" accept="image/*" capture="environment">` para captura desde cámara móvil. Guardar como `Blob` en estado local.
  - Firma del receptor: el placeholder visual queda — para la firma real (canvas) deferimos a PLAN-06 o future. **Decisión:** `urlFirma` se envía como `undefined` por ahora.
  - `handleConfirm("exitosa")`:

```ts
const registrar = useRegistrarParada();
await registrar.mutateAsync({
  rutaId: ruta.id,
  paqueteId: parada.paqueteId,
  paradaId: parada.id,
  resultado: "EXITOSA",
  fotoBlob,
  nombreReceptor,
});
toast({ title: isOnline ? "Entrega registrada" : "Guardada — sincronizará al reconectar" });
navigate("/conductor");
```

- Para FALLIDA y NOVEDAD: similar pero con `motivoNovedad` y sin foto

### F8.3 — ConductorCierrePage

- [ ] T526 [ConductorCierrePage.tsx](../../src/pages/conductor/ConductorCierrePage.tsx):
  - `const { data: ruta } = useRutaActiva();`
  - Calcular `sinGestionar` desde `ruta.paradas`
  - `handleClose`:

```ts
const cerrar = useCerrarRuta();
const handleClose = async () => {
  try {
    await cerrar.mutateAsync({
      rutaId: ruta.id,
      confirmarConPendientes: sinGestionar > 0,
    });
    toast({
      title: "Ruta cerrada",
      description: isOnline ? "Informe enviado." : "Pendiente de sincronización.",
    });
    navigate("/conductor");
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      toast({
        variant: "destructive",
        description: "Aún hay paradas pendientes. Vuelve a la ruta.",
      });
    } else {
      toast({ variant: "destructive", description: "No se pudo cerrar la ruta." });
    }
  }
};
```

- `<SyncBadge />` en el header
- `<PendientesBanner />` arriba si hay queue pending

---

## Fase 9 — Validación E2E

- [ ] T527 Tests unitarios:
  - `offline/queue.test.ts` (T511 ya cubierto)
  - `offline/sync-engine.test.ts` con fake-indexeddb + mock fetch — drain consume queue en orden, detiene en 5xx, descarta en 4xx
  - `services/conductor-operacion.test.ts` — `uploadFoto` envía multipart con header Authorization

- [ ] T528 E2E manual con backend levantado y usuario `DRIVER`:
  1. Login conductor con ruta CONFIRMADA → `/conductor` muestra la ruta real
  2. Confirmar inicio de tránsito → ruta a EN_TRANSITO
  3. Online: registrar parada exitosa con foto → backend recibe POST con URL S3 inmediatamente
  4. **Offline (DevTools → Network: Offline)**: registrar parada exitosa con foto → UI marca verde, `SyncBadge` muestra "1 pendiente"
  5. Volver online → drain automático → backend recibe la parada, `SyncBadge` muestra "0 pendientes" + last sync
  6. Cerrar ruta con `paradasPendientes > 0` → toast "Pendiente de sincronización" si offline
  7. Cerrar la app, reabrir offline → la ruta sigue visible (cache IndexedDB)
  8. Cerrar app con queue pendiente, reabrir online → drain inicial procesa pendientes
  9. Crear payload de parada con `motivoNovedad` inválido → 4xx → drain descarta + toast informativo

- [ ] T529 PWA install:
  - `npm run build && npm run preview` en HTTPS (puede usar `vite-plugin-mkcert`)
  - Chrome → menú "Instalar app" disponible
  - Una vez instalada, abrir sin red → app shell carga (LandingPage o última ruta)

- [ ] T530 `npm run typecheck`, `npm run lint`, `npm run test` pasan

---

## ✅ Checkpoint 5

- 3 pantallas del conductor leen de backend; ya no hay `R-2049` hardcoded.
- App registrada como PWA: instalable y carga offline.
- IndexedDB cachea la última ruta activa y la cola de mutaciones pendientes.
- Sync engine drena al transición online → online; al login; y manual desde `<SyncBadge>`.
- Foto POD: blob persistido offline, sube primero a S3 al sincronizar, luego registra la parada con la URL real.
- `fechaHoraAccion` capturada al momento del clic del conductor, propagada hasta el backend sin reescritura.
- Optimistic UI: la parada se marca verde/rojo localmente al confirmar, sin esperar respuesta de red.
- `SyncBadge` visible en las pantallas del conductor con estado online/offline + queue size + acción "Sincronizar ahora".
- Cierre de ruta con paradas pendientes envía `confirmarConPendientes: true` y maneja 409 si el backend rechaza.

---

## Orden Total de Ejecución

```
Sprint 0 — Config inicial (PLAN-00)
    └── Sprint 1 — Auth y rutas protegidas (PLAN-01)
            └── Sprint 2 — Servicios + React Query (PLAN-02)
                    └── Sprint 3 — Admin de flota integrado (PLAN-03)
                            └── Sprint 4 — Despachador integrado (PLAN-04)
                                    └── Sprint 5 — Conductor + offline + POD (PLAN-05)        ← Este archivo
                                            └── Sprint 6 — Limpieza final (PLAN-06)
```
