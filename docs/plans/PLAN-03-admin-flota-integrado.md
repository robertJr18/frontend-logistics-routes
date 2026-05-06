# PLAN-03 — Admin de Flota Integrado

**Date:** 2026-05-05
**Sprint:** 3 (depende de PLAN-02)
**Backend pareado:** PLAN-03 backend (T314–T323) — endpoints `/api/vehiculos/**` y `/api/conductores/**` con rol `FLEET_ADMIN`. Especificaciones: SPEC-03, SPEC-04, SPEC-05.

---

## Summary

Reemplazar `mockData` en las 6 pantallas del Administrador de Flota con queries y mutaciones reales contra el backend. Implementa CRUD de vehículos, CRUD de conductores, asignación conductor↔vehículo (con historial), panel de disponibilidad y consulta de detalle. Establece el patrón de DTOs + mappers + services + hooks que PLAN-04 y PLAN-05 replican para sus dominios.

**Detecté divergencias entre el prototipo y el contrato del backend** (formulario de conductor con campos inexistentes, toggle de estado en editar de vehículo que no tiene endpoint correspondiente). Este plan corrige los formularios para que reflejen la realidad del backend, no inventan campos.

---

## Decisiones

### 1. URLs siguen usando `placa` para vehículos

[AdminVehiculoDetallePage.tsx:8](../../src/pages/admin/AdminVehiculoDetallePage.tsx#L8) y [AdminVehiculoEditarPage.tsx:8](../../src/pages/admin/AdminVehiculoEditarPage.tsx#L8) usan `placa` como param. El backend trabaja con UUID `id`.

**Decisión:** mantener URLs con `placa` (URL human-readable) y usar la list-query cacheada por React Query para resolver `placa → id` en el cliente. No agregar endpoint `GET /api/vehiculos/by-placa`.

**Por qué:** la list-query ya está cargada cuando el usuario navega al detalle. Una segunda query "por placa" duplica datos. El hook `useVehiculoByPlaca(placa)` lee de la cache.

### 2. Sin estado toggle en editar; "Dar de baja" como acción separada

[AdminVehiculoEditarPage.tsx:107-122](../../src/pages/admin/AdminVehiculoEditarPage.tsx#L107-L122) deja al usuario cambiar el estado entre `Disponible` e `Inactivo`. El backend NO tiene endpoint para esto:

- `PUT /api/vehiculos/{id}` actualiza atributos, no estado
- `DELETE /api/vehiculos/{id}` "da de baja" (estado → INACTIVO)

**Decisión:**
- Quitar el toggle de estado del form de edición.
- En la pantalla de Detalle, agregar botón "Dar de baja" → llama `DELETE /api/vehiculos/{id}` con confirmación.
- **Reactivación de vehículos inactivos:** T301 verifica si el backend lo soporta. Si no, no se expone en UI; quedan como histórico inmutable.

### 3. Formulario de conductor refactorizado al contrato real

[AdminRegistrarConductorPage.tsx:11-14](../../src/pages/admin/AdminRegistrarConductorPage.tsx#L11-L14) pide `cedula`, `telefono`, `licencia`, `turno`. El backend (per [PLAN-03 backend](../../../docs/plans/PLAN-03-gestion-flota.md#T303) y schema) acepta:

```sql
conductores (
  id UUID,
  nombre VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE,
  modelo_contrato VARCHAR(50) NOT NULL,  -- RECORRIDO_COMPLETO | POR_PARADA
  estado estado_conductor NOT NULL,
  vehiculo_asignado_id UUID
)
```

**Decisión:** rehacer el formulario con los campos que el backend realmente acepta:

- `nombre` (requerido)
- `email` (requerido — el backend lo usa como identificador único)
- `modeloContrato`: select con `RECORRIDO_COMPLETO` o `POR_PARADA` (requerido — `SPEC-08` lo necesita en el evento `RUTA_CERRADA`)

Los campos `cedula`, `telefono`, `licencia`, `turno` se eliminan. Si en el futuro se requieren, hay que agregarlos primero al backend.

> **Nota documentada en T323 del plan:** este es el delta más visible del prototipo vs realidad. Comunicar al equipo en el PR.

### 4. Tabla de conductores: quitar columna "Turno Activo"

[AdminPage.tsx:118-130](../../src/pages/admin/AdminPage.tsx#L118-L130) muestra columna "Turno Activo". `turnoActivo` no existe en el backend.

**Decisión:** reemplazar la columna "Turno Activo" por "Modelo Contrato" (`Recorrido completo` | `Por parada`). Mantiene el ancho de la tabla y muestra info útil del backend.

### 5. Sección "Ruta Activa" e "Historial de Rutas" en detalle del vehículo se ocultan

[AdminVehiculoDetallePage.tsx:91-125](../../src/pages/admin/AdminVehiculoDetallePage.tsx#L91-L125) muestra rutas asociadas al vehículo. PLAN-03 no integra hooks de rutas — eso es PLAN-04.

**Decisión:** en este sprint, ocultar ambas secciones (`{false && ...}` o eliminación temporal con TODO). PLAN-04 las trae de vuelta usando `useRutasPorVehiculo(vehiculoId)` o el hook que corresponda.

### 6. Capacidad de peso: respetar la elección del usuario

El form actual [AdminRegistrarPage.tsx:14](../../src/pages/admin/AdminRegistrarPage.tsx#L14) precarga `capacidadVehiculo[tipo]` al cambiar tipo, pero permite editar. El backend acepta cualquier `capacidad_peso_kg > 0` (per schema CHECK).

**Decisión:** mantener el comportamiento actual (autocompletar por tipo, pero editable). T301 verifica si el backend rechaza capacidades fuera del rango típico del tipo — si lo hace, la UI debe mostrar el error de validación inline.

### 7. Zona de operación: enviar string descriptivo

Frontend [mockData.ts:19-31](../../src/data/mockData.ts#L19-L31) usa zonas descriptivas (`"Zona Norte, Santa Marta"`). Backend espera `zona_operacion VARCHAR(20)` con geohash precisión 3.

**Decisión:** enviar el string descriptivo tal cual lo selecciona el usuario. El backend almacena lo que reciba (no valida formato geohash en el insert). Documentar la divergencia. PLAN-06 (limpieza) decide si se cambia el contrato a geohash o se queda con descriptivo.

### 8. Forms con `useState` (no migrar a react-hook-form en este sprint)

`react-hook-form` y `zod` están instalados (PLAN-00) pero no se usan. Migrar los 4 formularios admin a RHF+Zod en este sprint multiplica el diff y la posibilidad de regresión.

**Decisión:** mantener `useState`. Validación inline en `handleSubmit`. Migración a RHF+Zod queda como mejora opcional para PLAN-06.

### 9. Manejo de errores específicos del dominio

El backend lanza:
- `PlacaDuplicadaException` → HTTP 409
- `VehiculoEnTransitoException` → HTTP 409 (al editar/borrar vehículo en tránsito)
- `ConductorYaAsignadoException` → HTTP 409 (al asignar)

**Decisión:** los hooks NO interpretan el error. Cada pantalla lo recibe como `ApiError` con `status: 409` y `body.code` (asumido — T301 verifica el shape) y muestra toast con mensaje específico:

```ts
if (err instanceof ApiError && err.status === 409) {
  if (err.body?.code === "PLACA_DUPLICADA") toast({ description: "Esa placa ya está registrada." });
  else if (err.body?.code === "VEHICULO_EN_TRANSITO") toast({ description: "No se puede modificar un vehículo en tránsito." });
  else toast({ description: err.body?.message ?? "Conflicto." });
}
```

T301 confirma que el backend retorna `{ code, message }` o similar. Si solo retorna `message`, los pantalla matchea por substring (`message.includes("placa")`).

---

## Estado actual (delta a aplicar)

| Archivo | Estado | Acción |
|---|---|---|
| [AdminPage.tsx](../../src/pages/admin/AdminPage.tsx) | Lee `vehiculos`, `conductores` de mockData | Reemplazar por `useVehiculos()` y `useConductores()`. Quitar columna "Turno Activo", agregar "Modelo Contrato". |
| [AdminRegistrarPage.tsx](../../src/pages/admin/AdminRegistrarPage.tsx) | `handleSubmit` mock, valida con `vehiculos.some(...)` | `useRegistrarVehiculo()`. Quitar validación local de placa duplicada (la hace el backend → 409). |
| [AdminRegistrarConductorPage.tsx](../../src/pages/admin/AdminRegistrarConductorPage.tsx) | Form con campos inexistentes en backend | Rehacer form: `nombre`, `email`, `modeloContrato`. `useRegistrarConductor()`. |
| [AdminAsignacionesPage.tsx](../../src/pages/admin/AdminAsignacionesPage.tsx) | Mock `handleAssign` | `useAsignarVehiculoConductor()`. |
| [AdminVehiculoDetallePage.tsx](../../src/pages/admin/AdminVehiculoDetallePage.tsx) | Lee de mockData | `useVehiculoByPlaca(placa)`. Ocultar secciones de rutas. Agregar botón "Dar de baja" → `useDarDeBajaVehiculo()`. |
| [AdminVehiculoEditarPage.tsx](../../src/pages/admin/AdminVehiculoEditarPage.tsx) | Toggle estado, `handleSave` mock | `useActualizarVehiculo()`. Quitar toggle estado. Resolver `placa → id` desde cache. |
| `src/types/dto/vehiculo.ts` | No existe | Crear (DTOs request + response) |
| `src/types/dto/conductor.ts` | No existe | Crear |
| `src/services/vehiculos.ts` | No existe | Crear |
| `src/services/conductores.ts` | No existe | Crear |
| `src/services/mappers/vehiculo.ts` | No existe | Crear |
| `src/services/mappers/conductor.ts` | No existe | Crear |
| `src/hooks/vehiculos/*` | No existe | Crear (un archivo por hook) |
| `src/hooks/conductores/*` | No existe | Crear |
| [src/lib/queryKeys.ts](../../src/lib/queryKeys.ts) | Solo namespace `vehiculos` (PLAN-02) | Agregar namespace `conductores` |
| [src/types/domain.ts](../../src/types/domain.ts) | Conductor con `turnoActivo`; sin `email`/`modeloContrato` | Actualizar tipo `Conductor`: quitar `turnoActivo`, agregar `email` y `modeloContrato`. |

---

## Estructura de archivos nuevos

```
src/
├── types/
│   ├── domain.ts                       [MODIFICAR] — Conductor sin turnoActivo, con email/modeloContrato
│   └── dto/
│       ├── vehiculo.ts                 [NUEVO]
│       └── conductor.ts                [NUEVO]
├── services/
│   ├── vehiculos.ts                    [NUEVO]
│   ├── conductores.ts                  [NUEVO]
│   └── mappers/
│       ├── vehiculo.ts                 [NUEVO]
│       └── conductor.ts                [NUEVO]
├── hooks/
│   ├── vehiculos/
│   │   ├── useVehiculos.ts             [NUEVO]
│   │   ├── useVehiculoByPlaca.ts       [NUEVO]
│   │   ├── useDisponibilidadFlota.ts   [NUEVO]
│   │   ├── useRegistrarVehiculo.ts     [NUEVO]
│   │   ├── useActualizarVehiculo.ts    [NUEVO]
│   │   └── useDarDeBajaVehiculo.ts     [NUEVO]
│   └── conductores/
│       ├── useConductores.ts           [NUEVO]
│       ├── useRegistrarConductor.ts    [NUEVO]
│       ├── useAsignarVehiculoConductor.ts    [NUEVO]
│       ├── useDesvincularVehiculoConductor.ts [NUEVO]
│       ├── useDarDeBajaConductor.ts    [NUEVO]
│       └── useHistorialConductor.ts    [NUEVO]
└── lib/queryKeys.ts                    [MODIFICAR] — agregar namespace conductores
```

---

## Fase 1 — Prerequisitos y verificación de contratos

- [ ] T301 Verificar contratos reales contra backend (con token de FLEET_ADMIN). Confirmar shape exacto de:
  - `GET /api/vehiculos` (listar)
  - `GET /api/vehiculos/{id}` (¿existe? si no, T303 ajusta el plan)
  - `GET /api/vehiculos/disponibilidad`
  - `POST /api/vehiculos` request + response
  - `PUT /api/vehiculos/{id}`
  - `DELETE /api/vehiculos/{id}`
  - `GET /api/conductores` (listar)
  - `POST /api/conductores`
  - `POST /api/conductores/{id}/asignar-vehiculo` body
  - `DELETE /api/conductores/{id}/desvincular-vehiculo`
  - `DELETE /api/conductores/{id}`
  - `GET /api/conductores/{id}/historial-asignaciones`
  - Shape del error 409: ¿`{ code, message }` o solo `{ message }`?
- [ ] T302 Verificar si el backend soporta reactivar vehículos `INACTIVO → DISPONIBLE`. Si no existe, anotar y NO exponer la acción en UI.
- [ ] T303 Si `GET /api/vehiculos/{id}` o `GET /api/conductores` no existen, ajustar el plan: `useVehiculoByPlaca` ya resuelve por cache; para conductores agregar query similar a vehículos.
- [ ] T304 Verificar que PLAN-02 está cerrado: `Authorization` header se inyecta automáticamente, 401 dispara logout, `QueryClient` configurado.

---

## Fase 2 — DTOs

- [ ] T305 Crear [src/types/dto/vehiculo.ts](../../src/types/dto/vehiculo.ts):

```ts
export type TipoVehiculoDto = "MOTO" | "VAN" | "NHR" | "TURBO";
export type EstadoVehiculoDto = "DISPONIBLE" | "EN_TRANSITO" | "INACTIVO";

export interface VehiculoResponse {
  id: string;
  placa: string;
  tipo: TipoVehiculoDto;
  modelo: string;
  capacidadPesoKg: number;
  volumenMaximoM3: number;
  zonaOperacion: string;
  estado: EstadoVehiculoDto;
  conductorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarVehiculoRequest {
  placa: string;
  tipo: TipoVehiculoDto;
  modelo: string;
  capacidadPesoKg: number;
  volumenMaximoM3: number;
  zonaOperacion: string;
}

export type ActualizarVehiculoRequest = Omit<RegistrarVehiculoRequest, "placa">;
```

- [ ] T306 Crear [src/types/dto/conductor.ts](../../src/types/dto/conductor.ts):

```ts
export type ModeloContratoDto = "RECORRIDO_COMPLETO" | "POR_PARADA";
export type EstadoConductorDto = "ACTIVO" | "INACTIVO" | "EN_RUTA";

export interface ConductorResponse {
  id: string;
  nombre: string;
  email: string;
  modeloContrato: ModeloContratoDto;
  estado: EstadoConductorDto;
  vehiculoAsignadoId: string | null;
}

export interface RegistrarConductorRequest {
  nombre: string;
  email: string;
  modeloContrato: ModeloContratoDto;
}

export interface AsignarVehiculoRequest {
  vehiculoId: string;
}

export interface HistorialAsignacionResponse {
  id: string;
  conductorId: string;
  vehiculoId: string;
  fechaHoraInicio: string;
  fechaHoraFin: string | null;
}
```

---

## Fase 3 — Actualizar tipos UI y formatters

- [ ] T307 Modificar [src/types/domain.ts](../../src/types/domain.ts) — `Conductor`:

```ts
export type ModeloContrato = "Recorrido completo" | "Por parada";

export interface Conductor {
  id: string;
  nombre: string;
  email: string;
  modeloContrato: ModeloContrato;
  estado: DriverStatus;
  vehiculoAsignado: string | null;  // mantenemos placa para compatibilidad UI
}
```

- [ ] T308 Modificar [src/data/mockData.ts](../../src/data/mockData.ts) — actualizar la lista de conductores mock para que tenga `email` y `modeloContrato`, sin `turnoActivo`. Esto mantiene los tests con mockData funcionando hasta que cada pantalla los reemplace por hooks.
- [ ] T309 Agregar a [src/lib/formatters.ts](../../src/lib/formatters.ts):

```ts
import type { ModeloContrato, VehicleType } from "@/types/domain";

export function formatModeloContrato(dto: string): ModeloContrato {
  return dto === "RECORRIDO_COMPLETO" ? "Recorrido completo" : "Por parada";
}

export function modeloContratoToDto(ui: ModeloContrato): "RECORRIDO_COMPLETO" | "POR_PARADA" {
  return ui === "Recorrido completo" ? "RECORRIDO_COMPLETO" : "POR_PARADA";
}

export function formatTipoVehiculo(dto: string): VehicleType {
  const map: Record<string, VehicleType> = {
    MOTO: "Moto", VAN: "Van", NHR: "NHR", TURBO: "Turbo",
  };
  return map[dto] ?? "Moto";
}

export function tipoVehiculoToDto(ui: VehicleType): "MOTO" | "VAN" | "NHR" | "TURBO" {
  const map: Record<VehicleType, "MOTO" | "VAN" | "NHR" | "TURBO"> = {
    Moto: "MOTO", Van: "VAN", NHR: "NHR", Turbo: "TURBO",
  };
  return map[ui];
}
```

---

## Fase 4 — Mappers

- [ ] T310 Crear [src/services/mappers/vehiculo.ts](../../src/services/mappers/vehiculo.ts):

```ts
import type { Vehiculo } from "@/types/domain";
import type { RegistrarVehiculoRequest, VehiculoResponse } from "@/types/dto/vehiculo";
import { formatTipoVehiculo, formatVehicleStatus, tipoVehiculoToDto } from "@/lib/formatters";
import type { ConductorResponse } from "@/types/dto/conductor";

export function toVehiculo(dto: VehiculoResponse, conductores: ConductorResponse[] = []): Vehiculo {
  const conductor = dto.conductorId ? conductores.find(c => c.id === dto.conductorId) : null;
  return {
    placa: dto.placa,
    tipo: formatTipoVehiculo(dto.tipo),
    modelo: dto.modelo,
    capacidadPeso: dto.capacidadPesoKg,
    volumenMax: dto.volumenMaximoM3,
    zona: dto.zonaOperacion,
    estado: formatVehicleStatus(dto.estado),
    conductorAsignado: conductor?.nombre ?? null,
  };
}

export function toRegistrarVehiculoRequest(form: {
  placa: string;
  tipo: import("@/types/domain").VehicleType;
  modelo: string;
  capacidad: number;
  volumen: number;
  zona: string;
}): RegistrarVehiculoRequest {
  return {
    placa: form.placa,
    tipo: tipoVehiculoToDto(form.tipo),
    modelo: form.modelo,
    capacidadPesoKg: form.capacidad,
    volumenMaximoM3: form.volumen,
    zonaOperacion: form.zona,
  };
}
```

> **Nota:** `toVehiculo` recibe la lista de conductores como parámetro opcional para resolver `conductorId → nombre`. Cuando no se pasa, devuelve `conductorAsignado: null`. El hook `useVehiculos` los carga juntos.

- [ ] T311 Crear [src/services/mappers/conductor.ts](../../src/services/mappers/conductor.ts):

```ts
import type { Conductor } from "@/types/domain";
import { formatModeloContrato } from "@/lib/formatters";
import type { ConductorResponse, RegistrarConductorRequest } from "@/types/dto/conductor";
import { modeloContratoToDto } from "@/lib/formatters";
import type { VehiculoResponse } from "@/types/dto/vehiculo";

export function toConductor(dto: ConductorResponse, vehiculos: VehiculoResponse[] = []): Conductor {
  const vehiculo = dto.vehiculoAsignadoId ? vehiculos.find(v => v.id === dto.vehiculoAsignadoId) : null;
  return {
    id: dto.id,
    nombre: dto.nombre,
    email: dto.email,
    modeloContrato: formatModeloContrato(dto.modeloContrato),
    estado: dto.estado === "INACTIVO" ? "Inactivo" : "Activo",
    vehiculoAsignado: vehiculo?.placa ?? null,
  };
}

export function toRegistrarConductorRequest(form: {
  nombre: string;
  email: string;
  modeloContrato: import("@/types/domain").ModeloContrato;
}): RegistrarConductorRequest {
  return {
    nombre: form.nombre,
    email: form.email,
    modeloContrato: modeloContratoToDto(form.modeloContrato),
  };
}
```

---

## Fase 5 — Services

- [ ] T312 Crear [src/services/vehiculos.ts](../../src/services/vehiculos.ts):

```ts
import { api } from "./api";
import type {
  ActualizarVehiculoRequest,
  RegistrarVehiculoRequest,
  VehiculoResponse,
} from "@/types/dto/vehiculo";

export const vehiculoService = {
  listar: () => api.get<VehiculoResponse[]>("/api/vehiculos"),
  disponibilidad: () => api.get<VehiculoResponse[]>("/api/vehiculos/disponibilidad"),
  registrar: (req: RegistrarVehiculoRequest) => api.post<VehiculoResponse>("/api/vehiculos", req),
  actualizar: (id: string, req: ActualizarVehiculoRequest) =>
    api.put<VehiculoResponse>(`/api/vehiculos/${id}`, req),
  darDeBaja: (id: string) => api.delete<void>(`/api/vehiculos/${id}`),
};
```

- [ ] T313 Crear [src/services/conductores.ts](../../src/services/conductores.ts):

```ts
import { api } from "./api";
import type {
  AsignarVehiculoRequest,
  ConductorResponse,
  HistorialAsignacionResponse,
  RegistrarConductorRequest,
} from "@/types/dto/conductor";

export const conductorService = {
  listar: () => api.get<ConductorResponse[]>("/api/conductores"),
  registrar: (req: RegistrarConductorRequest) => api.post<ConductorResponse>("/api/conductores", req),
  asignarVehiculo: (id: string, req: AsignarVehiculoRequest) =>
    api.post<void>(`/api/conductores/${id}/asignar-vehiculo`, req),
  desvincularVehiculo: (id: string) => api.delete<void>(`/api/conductores/${id}/desvincular-vehiculo`),
  darDeBaja: (id: string) => api.delete<void>(`/api/conductores/${id}`),
  historial: (id: string) => api.get<HistorialAsignacionResponse[]>(`/api/conductores/${id}/historial-asignaciones`),
};
```

---

## Fase 6 — Query keys

- [ ] T314 Modificar [src/lib/queryKeys.ts](../../src/lib/queryKeys.ts) — agregar namespace `conductores`:

```ts
export const queryKeys = {
  vehiculos: {
    all: ["vehiculos"] as const,
    list: () => [...queryKeys.vehiculos.all, "list"] as const,
    disponibilidad: () => [...queryKeys.vehiculos.all, "disponibilidad"] as const,
  },
  conductores: {
    all: ["conductores"] as const,
    list: () => [...queryKeys.conductores.all, "list"] as const,
    historial: (id: string) => [...queryKeys.conductores.all, "historial", id] as const,
  },
};
```

> Eliminamos `vehiculos.detail()` porque el detalle se resuelve desde la lista cacheada (decisión 1).

---

## Fase 7 — Hooks de vehículos

Cada hook va en su propio archivo siguiendo la convención de PLAN-02.

- [ ] T315 [src/hooks/vehiculos/useVehiculos.ts](../../src/hooks/vehiculos/useVehiculos.ts):

```ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";
import { vehiculoService } from "@/services/vehiculos";
import { toVehiculo } from "@/services/mappers/vehiculo";

export function useVehiculos() {
  return useQuery({
    queryKey: queryKeys.vehiculos.list(),
    queryFn: async () => {
      const [vehiculos, conductores] = await Promise.all([
        vehiculoService.listar(),
        conductorService.listar(),
      ]);
      return vehiculos.map(v => toVehiculo(v, conductores));
    },
  });
}
```

- [ ] T316 [src/hooks/vehiculos/useVehiculoByPlaca.ts](../../src/hooks/vehiculos/useVehiculoByPlaca.ts):

```ts
import { useVehiculos } from "./useVehiculos";

export function useVehiculoByPlaca(placa: string | undefined) {
  const query = useVehiculos();
  return {
    ...query,
    data: placa ? query.data?.find(v => v.placa === placa) : undefined,
  };
}
```

- [ ] T317 [src/hooks/vehiculos/useDisponibilidadFlota.ts](../../src/hooks/vehiculos/useDisponibilidadFlota.ts) — similar a `useVehiculos` pero llama `vehiculoService.disponibilidad()` y queryKey `disponibilidad()`.

- [ ] T318 [src/hooks/vehiculos/useRegistrarVehiculo.ts](../../src/hooks/vehiculos/useRegistrarVehiculo.ts):

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { vehiculoService } from "@/services/vehiculos";
import type { RegistrarVehiculoRequest } from "@/types/dto/vehiculo";

export function useRegistrarVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: RegistrarVehiculoRequest) => vehiculoService.registrar(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all }),
  });
}
```

- [ ] T319 [src/hooks/vehiculos/useActualizarVehiculo.ts](../../src/hooks/vehiculos/useActualizarVehiculo.ts) — patrón equivalente con `vehiculoService.actualizar(id, req)`.
- [ ] T320 [src/hooks/vehiculos/useDarDeBajaVehiculo.ts](../../src/hooks/vehiculos/useDarDeBajaVehiculo.ts) — `mutationFn: (id) => vehiculoService.darDeBaja(id)`.

---

## Fase 8 — Hooks de conductores

- [ ] T321 [src/hooks/conductores/useConductores.ts](../../src/hooks/conductores/useConductores.ts) — análogo a `useVehiculos` (carga conductores + vehículos para resolver el `vehiculoAsignado`).
- [ ] T322 [src/hooks/conductores/useRegistrarConductor.ts](../../src/hooks/conductores/useRegistrarConductor.ts).
- [ ] T323 [src/hooks/conductores/useAsignarVehiculoConductor.ts](../../src/hooks/conductores/useAsignarVehiculoConductor.ts) — invalida ambos namespaces porque la asignación afecta vehículos y conductores:

```ts
onSuccess: () => {
  qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all });
  qc.invalidateQueries({ queryKey: queryKeys.conductores.all });
}
```

- [ ] T324 [src/hooks/conductores/useDesvincularVehiculoConductor.ts](../../src/hooks/conductores/useDesvincularVehiculoConductor.ts) — misma invalidación cruzada.
- [ ] T325 [src/hooks/conductores/useDarDeBajaConductor.ts](../../src/hooks/conductores/useDarDeBajaConductor.ts).
- [ ] T326 [src/hooks/conductores/useHistorialConductor.ts](../../src/hooks/conductores/useHistorialConductor.ts) — `useQuery` con `queryKey: queryKeys.conductores.historial(id)`. `enabled: !!id`.

---

## Fase 9 — Refactor de pantallas

### F9.1 — AdminPage

- [ ] T327 [AdminPage.tsx](../../src/pages/admin/AdminPage.tsx):
  - Reemplazar imports de `vehiculos, conductores` por `useVehiculos()` y `useConductores()`
  - Manejar estados `isLoading` (skeletons o spinner) y `isError` (mensaje "No se pudo cargar la flota")
  - Stats cards: calcular desde `data ?? []` para evitar crash en loading
  - Tabla conductores: cambiar columna "Turno Activo" → "Modelo Contrato", mostrar `c.modeloContrato`
  - Botón "Editar" disabled si `v.estado === "En Tránsito"` (ya está)

### F9.2 — AdminRegistrarPage

- [ ] T328 [AdminRegistrarPage.tsx](../../src/pages/admin/AdminRegistrarPage.tsx):
  - `const registrar = useRegistrarVehiculo();`
  - Quitar la validación local `vehiculos.some(v => v.placa === placa)` (la hace el backend)
  - `handleSubmit`:

```ts
const handleSubmit = async () => {
  // ... validación local (placa no vacía, capacidad > 0, etc.)
  try {
    await registrar.mutateAsync(toRegistrarVehiculoRequest({ placa, tipo, modelo, capacidad, volumen, zona }));
    toast({ title: "Vehículo registrado", description: `${tipo} ${placa} registrado.` });
    navigate("/admin");
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      setErrors({ placa: "Esta placa ya está registrada en el backend." });
    } else {
      toast({ variant: "destructive", description: "No se pudo registrar el vehículo." });
    }
  }
};
```

  - Botón con `disabled={registrar.isPending}` y label dinámico ("Registrando..." mientras pendiente).

### F9.3 — AdminRegistrarConductorPage

- [ ] T329 [AdminRegistrarConductorPage.tsx](../../src/pages/admin/AdminRegistrarConductorPage.tsx) — **rehacer el formulario completo**:
  - Quitar campos: `cedula`, `telefono`, `licencia`, `turno`
  - Agregar: `email` (input type="email"), `modeloContrato` (select con `Recorrido completo` / `Por parada`)
  - Validación inline: `nombre`, `email` (regex), `modeloContrato` requeridos
  - `handleSubmit`: usar `useRegistrarConductor()`, manejar 409 (email duplicado, si el backend lo emite)
  - Mantener el layout grid, ajustar a 3 campos en 2 columnas

### F9.4 — AdminAsignacionesPage

- [ ] T330 [AdminAsignacionesPage.tsx](../../src/pages/admin/AdminAsignacionesPage.tsx):
  - Reemplazar `vehiculos` y `conductores` por hooks
  - `const asignar = useAsignarVehiculoConductor();`
  - `handleAssign`: llamar `asignar.mutateAsync({ conductorId, vehiculoId })`. Toast en éxito, manejar `ConductorYaAsignadoException` (HTTP 409) con toast claro.

### F9.5 — AdminVehiculoDetallePage

- [ ] T331 [AdminVehiculoDetallePage.tsx](../../src/pages/admin/AdminVehiculoDetallePage.tsx):
  - Reemplazar `vehiculos.find` por `useVehiculoByPlaca(placa)`
  - Manejar `isLoading` y `isError`
  - **Ocultar** `Ruta Activa` y `Historial de Rutas` (decisión 5) — comentar con `// TODO PLAN-04: re-enable with useRutasPorVehiculo`
  - Agregar botón "Dar de baja" (con confirmación dialog usando `<AlertDialog>` de shadcn) → llamar `useDarDeBajaVehiculo()` con el `id` real del vehículo (resolver desde el list-query). Disabled si `estado === "En Tránsito"`.
  - Después de baja exitosa: navigate a `/admin` con toast de confirmación.

### F9.6 — AdminVehiculoEditarPage

- [ ] T332 [AdminVehiculoEditarPage.tsx](../../src/pages/admin/AdminVehiculoEditarPage.tsx):
  - Resolver `placa → id` con `useVehiculoByPlaca` + leer del response DTO original (necesitamos exponer el `id` en el tipo UI o agregar un hook auxiliar `useVehiculoIdByPlaca`)
  - **Quitar el toggle de estado** (líneas 107–122)
  - `useActualizarVehiculo()` con `id`
  - `handleSave`: armar `ActualizarVehiculoRequest` (sin `placa`, ya que `PUT /api/vehiculos/{id}` no la cambia), `mutateAsync`, manejar 409 si el backend rechaza por `EN_TRANSITO`.

> **Sub-decisión:** para resolver `placa → id`, lo más limpio es agregar el `id` a la interfaz `Vehiculo` en [src/types/domain.ts](../../src/types/domain.ts). Hoy no está. T332b documenta este cambio.

- [ ] T332b Agregar `id: string` a `interface Vehiculo` en [src/types/domain.ts](../../src/types/domain.ts) y propagarlo en `toVehiculo()`. Actualizar mockData.ts para que cada vehículo mock tenga un id (UUID arbitrario).

---

## Fase 10 — Validación y tests

- [ ] T333 Tests unitarios mínimos:
  - `services/mappers/vehiculo.test.ts` — `toVehiculo` mapea correctamente con y sin conductor; `toRegistrarVehiculoRequest` invierte tipo y modelo.
  - `services/mappers/conductor.test.ts` — análogo.
  - `lib/formatters.test.ts` — agregar casos para `formatModeloContrato`, `formatTipoVehiculo`.

- [ ] T334 E2E manual con backend levantado y usuario `FLEET_ADMIN`:
  1. `/admin` carga lista real de vehículos y conductores
  2. Registrar vehículo nuevo → aparece en la tabla sin recargar (invalidación funciona)
  3. Registrar vehículo con placa duplicada → toast "Esta placa ya está registrada"
  4. Editar un vehículo `Disponible` → guardar → actualiza tabla
  5. Editar un vehículo `En Tránsito` → botón disabled (defensa cliente; el backend también rechaza)
  6. Dar de baja vehículo → confirmación → estado `Inactivo`
  7. Registrar conductor con email duplicado → toast de error
  8. Asignar conductor a vehículo → ambos tablas reflejan el cambio
  9. Re-asignar el mismo conductor a otro vehículo → toast "Ya tiene vehículo asignado"
  10. Historial de un conductor con varias asignaciones → muestra timeline correcto

- [ ] T335 `npm run typecheck`, `npm run lint`, `npm run test` pasan

---

## ✅ Checkpoint 3

- 6 pantallas admin no usan `mockData` para vehículos ni conductores. (Las secciones de rutas en `AdminVehiculoDetallePage` siguen ocultas hasta PLAN-04.)
- DTOs, mappers y services de `Vehiculo` y `Conductor` establecen el patrón que PLAN-04 y PLAN-05 replican.
- 11 hooks (6 vehículos + 5 conductores) en su carpeta correspondiente.
- Errores de dominio (placa duplicada, conductor ya asignado, vehículo en tránsito) se muestran con mensajes específicos.
- Form de conductor refleja el contrato real del backend (`nombre`, `email`, `modeloContrato`) — campos inventados (`cedula`, `licencia`, etc.) eliminados.
- `Conductor` UI type tiene `email` y `modeloContrato`; `turnoActivo` removido.

---

## Orden Total de Ejecución

```
Sprint 0 — Config inicial (PLAN-00)
    └── Sprint 1 — Auth y rutas protegidas (PLAN-01)
            └── Sprint 2 — Servicios + React Query (PLAN-02)
                    └── Sprint 3 — Admin de flota integrado (PLAN-03)        ← Este archivo
                            └── Sprint 4 — Despachador integrado (PLAN-04)
                                    └── Sprint 5 — Conductor + offline + POD (PLAN-05)
                                            └── Sprint 6 — Limpieza final (PLAN-06)
```
