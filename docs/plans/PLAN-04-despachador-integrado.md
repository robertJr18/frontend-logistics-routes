# PLAN-04 — Despachador Integrado

**Date:** 2026-05-05
**Sprint:** 4 (depende de PLAN-03)
**Backend pareado:** PLAN-01 backend (T120 `PlanificacionController`) + PLAN-02 backend (T216 `DespachoController`). Especificaciones: SPEC-01, SPEC-02.

---

## Summary

Reemplazar `mockData` en las 5 pantallas del Despachador Logístico con queries y mutaciones reales. Cubre: lista de rutas en sus 4 estados activos (CREADA, LISTA_PARA_DESPACHO, CONFIRMADA, EN_TRANSITO), confirmación de despacho con asignación de conductor + vehículo, exclusión de paquetes, despacho manual anticipado, cierre forzado, historial de rutas cerradas y alertas. También rehabilita las secciones de rutas en el detalle del vehículo (admin) que PLAN-03 dejó ocultas.

Hay un **bug de flujo** en el prototipo: el botón "Despachar ahora" sobre una ruta `CREADA` navega directo a la pantalla de confirmación sin llamar primero al endpoint `despacho-manual`, lo cual deja la ruta en estado inválido para confirmar. Este plan corrige ese flujo.

---

## Decisiones

### 1. "Despachar ahora" sobre CREADA llama despacho-manual primero

[DespachadorPage.tsx:97-99](../../src/pages/despachador/DespachadorPage.tsx#L97-L99) navega directo a `/despachador/despacho/{id}` desde una ruta `CREADA`. La ruta no se puede confirmar hasta transitionar a `LISTA_PARA_DESPACHO`.

**Decisión:**
- En `DespachadorPage`, el botón "Despachar ahora" (solo visible en CREADA) primero llama `useDespachoManual(rutaId)`. Al éxito, navega a `/despachador/despacho/{id}`.
- En LISTA_PARA_DESPACHO, el botón "Confirmar despacho" navega directo (la ruta ya está lista).
- Mientras la mutation está pendiente, deshabilitar el botón con label "Procesando…".

### 2. Una sola query `useRutas()` filtrada por estado en cliente

`GET /api/planificacion/rutas` retorna **todas las rutas activas** (CREADA + LISTA_PARA_DESPACHO + CONFIRMADA + EN_TRANSITO). El [DespachadorPage](../../src/pages/despachador/DespachadorPage.tsx) las muestra en 4 secciones distintas.

**Decisión:** una sola query carga la lista completa, las pantallas filtran por `estado` en cliente. Evita 4 queries separadas y mantiene la consistencia (todas las secciones reflejan el mismo snapshot).

`refetchInterval: 30_000` para que el dashboard se mantenga fresco sin refrescar manualmente.

### 3. `GET /api/despacho/rutas` solo para confirmar despacho

Ese endpoint específico retorna solo `LISTA_PARA_DESPACHO`. Para evitar duplicar queries, [DespachadorDespachoPage](../../src/pages/despachador/DespachadorDespachoPage.tsx) lee la ruta desde la cache de `useRutas()` resolviendo por id, mismo patrón que PLAN-03 con vehículos.

> Si T401 detecta que `GET /api/despacho/rutas` retorna info **diferente** (p.ej. paquetes con más detalle que la query general), usar ese endpoint solo para la pantalla de confirmación.

### 4. Endpoint de historial de rutas cerradas — verificar/decidir

El backend conocido (PLAN-01/PLAN-02 backend) NO expone explícitamente un endpoint para `CERRADA_MANUAL` / `CERRADA_AUTOMATICA` / `CERRADA_FORZADA`. Opciones:

- (a) `GET /api/planificacion/rutas?estado=CERRADA_*` (filtro por query param — verificar si existe)
- (b) Endpoint nuevo `GET /api/despacho/historial`
- (c) `GET /api/planificacion/rutas/historial`

**Decisión:** T401 verifica con el equipo backend. Si ningún endpoint existe, proponer agregar `GET /api/despacho/rutas/historial` al backend (queda fuera del scope de este plan frontend, pero la pantalla `DespachadorHistorialPage` queda en stand-by hasta tener el endpoint). Marcado como bloqueante para esa pantalla únicamente — el resto del sprint avanza.

### 5. Alertas computadas en cliente (sin WebSocket en este sprint)

[DespachadorAlertasPage.tsx:12-49](../../src/pages/despachador/DespachadorAlertasPage.tsx#L12-L49) tiene alertas hardcoded. El backend tiene `NotificacionDespachadorPort` con WebSocket (`WebSocketNotificacionAdapter`).

**Decisión:** las alertas se **derivan** de los datos de `useRutas()` en cliente, sin nuevo endpoint ni WebSocket. Reglas:

- **Urgente — vencimiento próximo:** ruta `CREADA` con `fechaLimiteDespacho` < 24h del momento actual.
- **Urgente — capacidad alta:** ruta `LISTA_PARA_DESPACHO` con `motivoDespacho === "Capacidad al 90%"`.
- **Info — parada fallida reciente:** ruta `EN_TRANSITO` con paradas en estado `FALLIDA` o `NOVEDAD` (últimas 24h).
- **Info — ruta confirmada hoy:** ruta `CONFIRMADA` con `fechaConfirmacion` del día.

WebSocket en tiempo real queda como mejora futura (no se documenta acá; cuando se quiera, se diseña un PLAN-XX dedicado).

### 6. Selector de tipo de vehículo en detalle: solo display, no mutation

[DespachadorDetallePage.tsx:75-87](../../src/pages/despachador/DespachadorDetallePage.tsx#L75-L87) deja al usuario cambiar `tipoVehiculo` en una ruta CREADA/LISTA. El backend NO expone endpoint para que el despachador modifique `tipoVehiculoRequerido` — eso lo decide el algoritmo (FR-005 SPEC-01).

**Decisión:** convertir el selector en display read-only (`<p>` en lugar de `<select>`). El comentario `canEdit` queda obsoleto en esa parte. Si el equipo decide que el despachador SÍ puede sobreescribirlo, hay que agregar un endpoint primero — fuera de scope de este plan.

### 7. Exclusión de paquetes: mutation por paquete

El backend acepta `DELETE /api/despacho/rutas/{id}/paquetes/{paqueteId}?motivo=<texto>` por paquete (uno a la vez).

**Decisión:** [DespachadorDespachoPage.tsx:54-61](../../src/pages/despachador/DespachadorDespachoPage.tsx#L54-L61) hoy mantiene un `Set<string>` local de exclusiones que no envía al backend. Cambia a:
- Cada toggle dispara `useExcluirPaquete(rutaId, paqueteId, motivo)` inmediatamente
- La cache invalida la ruta y vuelve a leer la lista de paquetes
- Loading state por paquete (disabled durante el pending)

**Por qué inmediato y no batch:** SPEC-08 evento 9 indica que `PAQUETE_EXCLUIDO_DESPACHO` se emite al excluir; el despachador debe ver la confirmación de cada exclusión antes de confirmar el despacho final.

### 8. Confirmación de despacho: campos exactos

`POST /api/despacho/rutas/{id}/confirmar` recibe `{ conductorId, vehiculoId }` (per [PLAN-02 backend T217](../../../docs/plans/PLAN-02-despacho-rutas.md#T217)). El form actual auto-asigna conductor con vehículo y permite cambiarlo.

**Decisión:** mantener el flujo actual (auto-pick + cambiar). Validaciones de cliente:
- `conductorId` y `vehiculoId` ambos requeridos
- Si la ruta tiene `tipoVehiculoRequerido` definido, el vehículo seleccionado debe ser de ese tipo (defensa cliente; el backend valida también).

Errores 409 esperados:
- `ConductorNoDisponibleException` → "El conductor ya no está activo. Selecciona otro."
- `VehiculoNoDisponibleException` → "El vehículo no está disponible. Selecciona otro."

### 9. Forzar cierre desde detalle de ruta EN_TRANSITO

El [DespachoController](../../../docs/plans/PLAN-02-despacho-rutas.md#T216) tiene `POST /api/despacho/rutas/{id}/forzar-cierre`. La UI actual no expone esta acción.

**Decisión:** agregar botón "Forzar cierre" en `DespachadorDetallePage` cuando `estado === "En Tránsito"`. Confirmación con `<AlertDialog>` que advierte "Esta acción cierra la ruta y marca paradas pendientes como sin gestionar". Llama `useForzarCierreRuta(id)`.

### 10. Rehabilitación de rutas en `AdminVehiculoDetallePage`

PLAN-03 (decisión 5) ocultó las secciones "Ruta Activa" e "Historial de Rutas". Este plan las trae de vuelta usando `useRutas()` y filtrando por `vehiculoAsignadoId === vehiculo.id`.

---

## Estado actual (delta a aplicar)

| Archivo | Estado | Acción |
|---|---|---|
| [DespachadorPage.tsx](../../src/pages/despachador/DespachadorPage.tsx) | Lee `rutas` de mockData, agrupa por estado | `useRutas()`, agrupar en cliente. Botón "Despachar ahora" llama `despacho-manual`. |
| [DespachadorDetallePage.tsx](../../src/pages/despachador/DespachadorDetallePage.tsx) | Lee de mockData; selector tipo vehículo editable | `useRutaById(id)`. Selector tipo vehículo → display. Agregar "Forzar cierre" si EN_TRANSITO. |
| [DespachadorDespachoPage.tsx](../../src/pages/despachador/DespachadorDespachoPage.tsx) | Mock de exclusión local; auto-asigna conductor de mockData | `useRutaById(id)` + `useConductores()` + `useVehiculos()` (de PLAN-03). Exclusión vía `useExcluirPaquete`. Confirmación vía `useConfirmarDespacho`. |
| [DespachadorHistorialPage.tsx](../../src/pages/despachador/DespachadorHistorialPage.tsx) | Array hardcoded `rutasCerradas` | `useRutasHistorial()` — bloqueada por T401 hasta confirmar endpoint. |
| [DespachadorAlertasPage.tsx](../../src/pages/despachador/DespachadorAlertasPage.tsx) | Array hardcoded | Computar alertas en cliente desde `useRutas()`. Sidebar badge debe reflejar el conteo real. |
| [AdminVehiculoDetallePage.tsx](../../src/pages/admin/AdminVehiculoDetallePage.tsx) | Secciones de rutas ocultas (PLAN-03) | Re-habilitar usando `useRutas()` filtrado por vehículo. |
| `src/types/dto/ruta.ts` | No existe | Crear |
| `src/types/dto/parada.ts` | No existe | Crear |
| `src/services/rutas.ts` | No existe | Crear |
| `src/services/despacho.ts` | No existe | Crear |
| `src/services/planificacion.ts` | No existe | Crear |
| `src/services/mappers/ruta.ts` | No existe | Crear |
| `src/services/mappers/parada.ts` | No existe | Crear |
| `src/hooks/rutas/*` | No existe | Crear |
| `src/hooks/despacho/*` | No existe | Crear |
| [src/lib/queryKeys.ts](../../src/lib/queryKeys.ts) | Solo `vehiculos`, `conductores` (PLAN-02/03) | Agregar namespace `rutas` |

---

## Estructura de archivos nuevos

```
src/
├── types/dto/
│   ├── ruta.ts                          [NUEVO]
│   └── parada.ts                        [NUEVO]
├── services/
│   ├── rutas.ts                         [NUEVO]
│   ├── despacho.ts                      [NUEVO]
│   ├── planificacion.ts                 [NUEVO]
│   └── mappers/
│       ├── ruta.ts                      [NUEVO]
│       └── parada.ts                    [NUEVO]
├── hooks/
│   ├── rutas/
│   │   ├── useRutas.ts                  [NUEVO]
│   │   ├── useRutaById.ts               [NUEVO]
│   │   └── useRutasHistorial.ts         [NUEVO]  (bloqueado por T401)
│   └── despacho/
│       ├── useDespachoManual.ts         [NUEVO]
│       ├── useConfirmarDespacho.ts      [NUEVO]
│       ├── useExcluirPaquete.ts         [NUEVO]
│       └── useForzarCierreRuta.ts       [NUEVO]
└── lib/
    ├── queryKeys.ts                     [MODIFICAR]
    └── alertas.ts                       [NUEVO]  — derivación de alertas en cliente
```

---

## Fase 1 — Prerequisitos y verificación de contratos

- [ ] T401 Verificar contratos contra backend con token `DISPATCHER`:
  - `GET /api/planificacion/rutas` — ¿retorna todas las rutas activas o filtra por estado?
  - `GET /api/despacho/rutas` — confirmar que retorna solo LISTA_PARA_DESPACHO
  - `POST /api/planificacion/rutas/{id}/despacho-manual` — body, response
  - `POST /api/despacho/rutas/{id}/confirmar` — body `{ conductorId, vehiculoId }`, response
  - `DELETE /api/despacho/rutas/{id}/paquetes/{paqueteId}?motivo=...`
  - `POST /api/despacho/rutas/{id}/forzar-cierre`
  - **Endpoint de historial:** confirmar con backend si existe `GET /api/planificacion/rutas?estado=...` o si hay que pedirles agregar uno. Si no existe → bloquear solo `DespachadorHistorialPage`, el resto avanza.
- [ ] T402 Verificar el shape exacto de `RutaResponse` (paquetes embebidos, paradas embebidas, fechas, motivos). Decodificar en consola para conocer todos los campos.
- [ ] T403 Verificar que PLAN-03 está cerrado: `useVehiculos()` y `useConductores()` funcionan, las pantallas admin leen del backend.

---

## Fase 2 — DTOs

- [ ] T404 Crear [src/types/dto/parada.ts](../../src/types/dto/parada.ts):

```ts
export type EstadoParadaDto =
  | "PENDIENTE" | "EXITOSA" | "FALLIDA" | "NOVEDAD"
  | "SIN_GESTION_CONDUCTOR" | "EXCLUIDA_DESPACHO";

export type MotivoNovedadDto =
  | "CLIENTE_AUSENTE" | "DIRECCION_INCORRECTA" | "ZONA_DIFICIL_ACCESO"
  | "RECHAZADO_POR_CLIENTE" | "DAÑADO_EN_RUTA" | "EXTRAVIADO" | "DEVOLUCION";

export interface ParadaResponse {
  id: string;
  rutaId: string;
  paqueteId: string;
  orden: number;
  direccion: string;
  latitud: number;
  longitud: number;
  tipoMercancia: "FRAGIL" | "PELIGROSO" | "ESTANDAR" | null;
  metodoPago: "PREPAGO" | "CONTRA_ENTREGA" | null;
  fechaLimiteEntrega: string | null;
  estado: EstadoParadaDto;
  motivoNovedad: MotivoNovedadDto | null;
  fechaHoraGestion: string | null;
  firmaReceptorUrl: string | null;
  fotoEvidenciaUrl: string | null;
  nombreReceptor: string | null;
  origen: "CONDUCTOR" | "SISTEMA";
}
```

- [ ] T405 Crear [src/types/dto/ruta.ts](../../src/types/dto/ruta.ts):

```ts
import type { TipoVehiculoDto } from "./vehiculo";
import type { ParadaResponse } from "./parada";

export type EstadoRutaDto =
  | "CREADA" | "LISTA_PARA_DESPACHO" | "CONFIRMADA" | "EN_TRANSITO"
  | "CERRADA_MANUAL" | "CERRADA_AUTOMATICA" | "CERRADA_FORZADA";

export type TipoCierreDto = "MANUAL" | "AUTOMATICO" | "FORZADO_DESPACHADOR";

export interface RutaResponse {
  id: string;
  zona: string;
  estado: EstadoRutaDto;
  pesoAcumuladoKg: number;
  tipoVehiculoRequerido: TipoVehiculoDto;
  vehiculoId: string | null;
  conductorId: string | null;
  fechaCreacionRuta: string;
  fechaLimiteDespacho: string;
  fechaHoraInicio: string | null;
  fechaHoraCierre: string | null;
  tipoCierre: TipoCierreDto | null;
  motivoDespacho: string | null;
  paradas: ParadaResponse[];
}

export interface ConfirmarDespachoRequest {
  conductorId: string;
  vehiculoId: string;
}
```

- [ ] T406 Verificar y ajustar contra T402 (puede que el backend devuelva `paquetes[]` separado de `paradas[]`, o que algún campo difiera).

---

## Fase 3 — Mappers y formatters

- [ ] T407 Extender [src/lib/formatters.ts](../../src/lib/formatters.ts):

```ts
export function formatMotivoNovedad(dto: string): string {
  const map: Record<string, string> = {
    CLIENTE_AUSENTE: "Cliente ausente",
    DIRECCION_INCORRECTA: "Dirección incorrecta",
    ZONA_DIFICIL_ACCESO: "Zona difícil acceso",
    RECHAZADO_POR_CLIENTE: "Rechazado por cliente",
    "DAÑADO_EN_RUTA": "Dañado en ruta",
    EXTRAVIADO: "Extraviado",
    DEVOLUCION: "Devolución",
  };
  return map[dto] ?? dto;
}
```

- [ ] T408 Crear [src/services/mappers/parada.ts](../../src/services/mappers/parada.ts):

```ts
import { formatStopStatus } from "@/lib/formatters";
import type { Parada } from "@/types/domain";
import type { ParadaResponse } from "@/types/dto/parada";

export function toParada(dto: ParadaResponse, indice: number): Parada {
  return {
    numero: dto.orden || indice + 1,
    paqueteId: dto.paqueteId,
    direccion: dto.direccion,
    destinatario: dto.nombreReceptor ?? "—",
    peso: 0,  // el peso del paquete no está en ParadaResponse; se obtiene del backend si lo expone, sino mockeado
    status: formatStopStatus(dto.estado),
    motivoFallo: dto.motivoNovedad ?? undefined,
  };
}
```

> **Nota:** el backend NO expone `peso` por parada (solo por paquete agregado en la ruta). Si la pantalla lo necesita, T402 valida si el backend lo embebe. Si no, se calcula desde `pesoAcumuladoKg / paradas.length` (estimación) o se acepta que la columna "Peso" muestre `—`.

- [ ] T409 Crear [src/services/mappers/ruta.ts](../../src/services/mappers/ruta.ts):

```ts
import { formatRouteStatus, formatTipoVehiculo } from "@/lib/formatters";
import type { Ruta } from "@/types/domain";
import type { RutaResponse } from "@/types/dto/ruta";
import type { VehiculoResponse } from "@/types/dto/vehiculo";
import type { ConductorResponse } from "@/types/dto/conductor";
import { toParada } from "./parada";

export function toRuta(
  dto: RutaResponse,
  vehiculos: VehiculoResponse[] = [],
  conductores: ConductorResponse[] = [],
): Ruta {
  const vehiculo = dto.vehiculoId ? vehiculos.find(v => v.id === dto.vehiculoId) : null;
  const conductor = dto.conductorId ? conductores.find(c => c.id === dto.conductorId) : null;

  return {
    id: dto.id,
    zona: dto.zona,
    ciudad: "—",  // backend no separa ciudad; PLAN-06 unifica el modelo
    paquetes: dto.paradas.map(p => ({
      id: p.paqueteId,
      peso: 0,
      direccion: p.direccion,
      zona: dto.zona,
      fechaLimiteEntrega: p.fechaLimiteEntrega ?? "",
      tipoPaquete: p.tipoMercancia ?? "ESTANDAR",
    })),
    pesoTotal: dto.pesoAcumuladoKg,
    vehiculoRequerido: formatTipoVehiculo(dto.tipoVehiculoRequerido),
    estado: formatRouteStatus(dto.estado),
    fechaCreacion: dto.fechaCreacionRuta,
    fechaLimiteDespacho: dto.fechaLimiteDespacho,
    motivoDespacho: dto.motivoDespacho ?? undefined,
    vehiculoAsignado: vehiculo?.placa,
    conductorAsignado: conductor?.nombre,
    paradas: dto.paradas.map(toParada),
  };
}
```

> **Nota sobre `ciudad`:** el backend usa `zona` como identificador (geohash o descriptivo). El modelo UI separa zona/ciudad. Hasta unificación en PLAN-06, `ciudad` queda como `"—"`. La pantalla muestra `{ruta.zona}, {ruta.ciudad}` → quedará `"Zona X, —"`. Aceptable temporalmente.

- [ ] T410 Agregar a [src/types/domain.ts](../../src/types/domain.ts) el campo `id` también en `Ruta` (ya existe), pero confirmar que no falta nada usado por el backend (`fechaHoraInicio`, `fechaHoraCierre`, `tipoCierre`).

---

## Fase 4 — Services

- [ ] T411 [src/services/rutas.ts](../../src/services/rutas.ts):

```ts
import { api } from "./api";
import type { RutaResponse } from "@/types/dto/ruta";

export const rutaService = {
  listarActivas: () => api.get<RutaResponse[]>("/api/planificacion/rutas"),
  // listarHistorial: bloqueado por T401 — implementar cuando el endpoint exista
};
```

- [ ] T412 [src/services/despacho.ts](../../src/services/despacho.ts):

```ts
import { api } from "./api";
import type { ConfirmarDespachoRequest, RutaResponse } from "@/types/dto/ruta";

export const despachoService = {
  listarParaDespacho: () => api.get<RutaResponse[]>("/api/despacho/rutas"),
  confirmar: (rutaId: string, req: ConfirmarDespachoRequest) =>
    api.post<RutaResponse>(`/api/despacho/rutas/${rutaId}/confirmar`, req),
  excluirPaquete: (rutaId: string, paqueteId: string, motivo: string) =>
    api.delete<void>(`/api/despacho/rutas/${rutaId}/paquetes/${paqueteId}?motivo=${encodeURIComponent(motivo)}`),
  forzarCierre: (rutaId: string) =>
    api.post<void>(`/api/despacho/rutas/${rutaId}/forzar-cierre`),
};
```

- [ ] T413 [src/services/planificacion.ts](../../src/services/planificacion.ts):

```ts
import { api } from "./api";

export const planificacionService = {
  despachoManual: (rutaId: string) =>
    api.post<void>(`/api/planificacion/rutas/${rutaId}/despacho-manual`),
};
```

---

## Fase 5 — Query keys

- [ ] T414 Modificar [src/lib/queryKeys.ts](../../src/lib/queryKeys.ts) — agregar namespace `rutas`:

```ts
rutas: {
  all: ["rutas"] as const,
  list: () => [...queryKeys.rutas.all, "list"] as const,
  historial: () => [...queryKeys.rutas.all, "historial"] as const,
},
```

---

## Fase 6 — Hooks

- [ ] T415 [src/hooks/rutas/useRutas.ts](../../src/hooks/rutas/useRutas.ts):

```ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { rutaService } from "@/services/rutas";
import { vehiculoService } from "@/services/vehiculos";
import { conductorService } from "@/services/conductores";
import { toRuta } from "@/services/mappers/ruta";

export function useRutas() {
  return useQuery({
    queryKey: queryKeys.rutas.list(),
    queryFn: async () => {
      const [rutas, vehiculos, conductores] = await Promise.all([
        rutaService.listarActivas(),
        vehiculoService.listar(),
        conductorService.listar(),
      ]);
      return rutas.map(r => toRuta(r, vehiculos, conductores));
    },
    refetchInterval: 30_000,
  });
}
```

- [ ] T416 [src/hooks/rutas/useRutaById.ts](../../src/hooks/rutas/useRutaById.ts) — análogo a `useVehiculoByPlaca` (decisión 1, PLAN-03): leer de la cache de `useRutas`.
- [ ] T417 [src/hooks/rutas/useRutasHistorial.ts](../../src/hooks/rutas/useRutasHistorial.ts) — implementar cuando T401 confirme el endpoint. Mientras: stub con `enabled: false` y `// TODO PLAN-04 T417 — esperando endpoint backend`.
- [ ] T418 [src/hooks/despacho/useDespachoManual.ts](../../src/hooks/despacho/useDespachoManual.ts):

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { planificacionService } from "@/services/planificacion";

export function useDespachoManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rutaId: string) => planificacionService.despachoManual(rutaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.rutas.all }),
  });
}
```

- [ ] T419 [src/hooks/despacho/useConfirmarDespacho.ts](../../src/hooks/despacho/useConfirmarDespacho.ts) — invalida `rutas`, `vehiculos`, `conductores` (todos cambian de estado al confirmar).
- [ ] T420 [src/hooks/despacho/useExcluirPaquete.ts](../../src/hooks/despacho/useExcluirPaquete.ts):

```ts
return useMutation({
  mutationFn: ({ rutaId, paqueteId, motivo }: { rutaId: string; paqueteId: string; motivo: string }) =>
    despachoService.excluirPaquete(rutaId, paqueteId, motivo),
  onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.rutas.all }),
});
```

- [ ] T421 [src/hooks/despacho/useForzarCierreRuta.ts](../../src/hooks/despacho/useForzarCierreRuta.ts) — invalida `rutas`, `vehiculos`, `conductores`.

---

## Fase 7 — Lógica de alertas

- [ ] T422 Crear [src/lib/alertas.ts](../../src/lib/alertas.ts) con la derivación documentada en decisión 5:

```ts
import type { Ruta } from "@/types/domain";

export interface Alerta {
  id: string;
  tipo: "urgente" | "info";
  titulo: string;
  descripcion: string;
  fecha: string;
  rutaId: string;
  accion?: "Despachar ahora" | null;
}

const HOUR = 60 * 60 * 1000;

export function derivarAlertas(rutas: Ruta[], now: Date = new Date()): Alerta[] {
  const alertas: Alerta[] = [];

  rutas.forEach(r => {
    // Vencimiento próximo
    if (r.estado === "Creada") {
      const limite = new Date(r.fechaLimiteDespacho).getTime();
      if (limite - now.getTime() < 24 * HOUR) {
        alertas.push({
          id: `venc-${r.id}`,
          tipo: "urgente",
          titulo: `Ruta ${r.id} próxima a vencer`,
          descripcion: `Plazo: ${r.fechaLimiteDespacho}. ${r.paquetes.length} paquetes pendientes.`,
          fecha: r.fechaLimiteDespacho,
          rutaId: r.id,
          accion: "Despachar ahora",
        });
      }
    }

    // Capacidad alta
    if (r.estado === "Lista para Despacho" && r.motivoDespacho?.includes("90")) {
      alertas.push({
        id: `cap-${r.id}`,
        tipo: "urgente",
        titulo: `Ruta ${r.id} al 90% de capacidad`,
        descripcion: `${r.pesoTotal} kg en vehículo ${r.vehiculoRequerido}.`,
        fecha: r.fechaCreacion,
        rutaId: r.id,
        accion: "Despachar ahora",
      });
    }

    // Parada fallida en EN_TRANSITO
    if (r.estado === "En Tránsito") {
      const fallidas = r.paradas.filter(p => p.status === "Fallida" || p.status === "Novedad");
      fallidas.forEach(p => {
        alertas.push({
          id: `fail-${r.id}-${p.numero}`,
          tipo: "info",
          titulo: `Parada ${p.status.toLowerCase()} en ${r.id}`,
          descripcion: `Parada ${p.numero} (${p.destinatario}). ${p.motivoFallo ?? ""}`,
          fecha: r.fechaCreacion,
          rutaId: r.id,
          accion: null,
        });
      });
    }
  });

  return alertas.sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === "urgente" ? -1 : 1;
    return b.fecha.localeCompare(a.fecha);
  });
}
```

- [ ] T423 Test `src/lib/alertas.test.ts` con casos:
  - Ruta CREADA con `fechaLimiteDespacho` < 24h → genera alerta urgente
  - Ruta CREADA con plazo lejano → no alerta
  - Ruta LISTA_PARA_DESPACHO con `motivoDespacho` que incluye "90" → urgente
  - Ruta EN_TRANSITO con paradas FALLIDA → info por cada parada
  - Orden: urgentes primero

---

## Fase 8 — Refactor de pantallas

### F8.1 — DespachadorPage

- [ ] T424 [DespachadorPage.tsx](../../src/pages/despachador/DespachadorPage.tsx):
  - Reemplazar `import { rutas }` por `const { data: rutas = [] } = useRutas();`
  - Loading skeleton mientras `isLoading`
  - Cálculo del badge de "Alertas" desde `derivarAlertas(rutas).filter(a => a.tipo === "urgente").length` (eliminar el "2" hardcoded en `sidebarItems`)
  - Botón "Despachar ahora" sobre CREADA:

```tsx
const despachoManual = useDespachoManual();
const handleDespacharAhora = async (rutaId: string) => {
  try {
    await despachoManual.mutateAsync(rutaId);
    navigate(`/despachador/despacho/${rutaId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      toast({ variant: "destructive", description: err.body?.message ?? "No se pudo pasar a despacho." });
    }
  }
};
```

  - Manejar `getTimeRemaining` con la fecha actual real (no `2026-03-13` hardcoded). Si la fecha es del pasado lejano, mostrar "Vencido".

### F8.2 — DespachadorDetallePage

- [ ] T425 [DespachadorDetallePage.tsx](../../src/pages/despachador/DespachadorDetallePage.tsx):
  - Reemplazar `rutas.find(r => r.id === id)` por `const { data: ruta } = useRutaById(id);`
  - **Decisión 6:** convertir el `<select>` de tipo vehículo (líneas 75–87) en un display:

```tsx
<p className="text-white font-semibold">{ruta.vehiculoRequerido}</p>
```

  Eliminar `vehiculoTipo` state, `setVehiculoTipo`, `capacidad`, `porcentaje` del `vehiculoTipo` mutable. La barra de progreso usa `ruta.vehiculoRequerido` directamente.
  - El toggle de exclusión local se queda PARA EL DETALLE (no muta backend desde aquí — la mutación vive en `DespachadorDespachoPage`). Esta pantalla es solo lectura/preview.
  - Agregar botón "Forzar cierre" si `estado === "En Tránsito"`:

```tsx
{ruta.estado === "En Tránsito" && (
  <button onClick={openForzarCierreDialog} className="btn-destructive">Forzar cierre</button>
)}
```

  Con `<AlertDialog>` de shadcn que advierte el comportamiento. Llama `useForzarCierreRuta()`.

### F8.3 — DespachadorDespachoPage

- [ ] T426 [DespachadorDespachoPage.tsx](../../src/pages/despachador/DespachadorDespachoPage.tsx):
  - Reemplazar lectura de mockData (`rutas`, `vehiculos`, `conductores`) por hooks correspondientes
  - **Cambiar la lógica de exclusión local por la mutación**:

```tsx
const excluir = useExcluirPaquete();
const toggleExclude = (paqueteId: string) => {
  // Modal pidiendo motivo, luego:
  excluir.mutate({ rutaId: ruta.id, paqueteId, motivo });
};
```

  Mostrar un dialog con input de motivo antes de excluir (el backend lo requiere como query param).
  - El estado `excludedPkgs` local desaparece — el ground truth es el backend (paquetes con estado `EXCLUIDA_DESPACHO` o ausentes de la lista).
  - `handleConfirm` llama `useConfirmarDespacho().mutateAsync({ conductorId, vehiculoId })`. En éxito: toast + navigate. En error 409: mensaje específico (ver decisión 8).

### F8.4 — DespachadorHistorialPage

- [ ] T427 [DespachadorHistorialPage.tsx](../../src/pages/despachador/DespachadorHistorialPage.tsx):
  - **Bloqueado por T401.** Si el endpoint de historial existe → reemplazar el array hardcoded por `useRutasHistorial()`.
  - Si no existe → marcar la pantalla con un mensaje "Historial pendiente de implementación en backend" y dejar el array hardcoded como placeholder visual hasta que el endpoint esté disponible. Documentar en el PR.

### F8.5 — DespachadorAlertasPage

- [ ] T428 [DespachadorAlertasPage.tsx](../../src/pages/despachador/DespachadorAlertasPage.tsx):
  - Reemplazar `alertas` hardcoded por:

```tsx
const { data: rutas = [] } = useRutas();
const alertas = useMemo(() => derivarAlertas(rutas), [rutas]);
```

  - Sidebar badge: usar el conteo real de urgentes
  - El click en "Despachar ahora" sigue navegando a `/despachador/despacho/{rutaId}` (recordar: si la ruta es CREADA, ese flujo debe llamar despacho-manual primero — usar el mismo handler de F8.1, refactorizar a un hook común si es necesario).

- [ ] T429 Sincronizar el badge de "Alertas" en el sidebar de TODAS las páginas de despachador (DespachadorPage, HistorialPage, AlertasPage). Hoy cada una tiene un array `sidebarItems` con `badge: "2"` hardcoded. Extraer a un componente compartido `<DespachadorSidebar />` que lea el conteo desde `useRutas` + `derivarAlertas`.

### F8.6 — Re-habilitar rutas en AdminVehiculoDetallePage

- [ ] T430 [AdminVehiculoDetallePage.tsx](../../src/pages/admin/AdminVehiculoDetallePage.tsx):
  - Quitar el `// TODO PLAN-04` que dejó PLAN-03
  - `const { data: rutas = [] } = useRutas();`
  - `const rutasVehiculo = rutas.filter(r => r.vehiculoAsignado === vehiculo.placa);`
  - `const rutaActiva = rutasVehiculo.find(r => r.estado === "En Tránsito" || r.estado === "Confirmada");`
  - Renderizar las dos secciones como antes

---

## Fase 9 — Validación y tests

- [ ] T431 Tests unitarios:
  - `services/mappers/ruta.test.ts` — `toRuta` con vehículo y conductor resueltos
  - `services/mappers/parada.test.ts` — `toParada` con orden 0 vs orden explícito
  - `lib/alertas.test.ts` — T423 ya cubierto

- [ ] T432 E2E manual con backend levantado y usuario `DISPATCHER`:
  1. `/despachador` carga rutas reales agrupadas por estado
  2. "Despachar ahora" sobre una CREADA → llama despacho-manual → navega a confirmar
  3. En la pantalla de confirmar: excluir un paquete con motivo → backend recibe DELETE, paquete desaparece de la lista
  4. Auto-pick de conductor → permitir cambiar → confirmar → toast → ruta pasa a CONFIRMADA, vehículo a EN_TRANSITO, conductor a EN_RUTA (visible en panel admin si se abre)
  5. Confirmar despacho con un conductor INACTIVO (alterar el estado en backend manualmente) → toast con mensaje específico
  6. Sobre una ruta EN_TRANSITO: forzar cierre → confirmación → ruta a CERRADA_FORZADA
  7. Pestaña "Alertas" → muestra alertas derivadas: rutas próximas a vencer, capacidad alta, paradas fallidas
  8. Pestaña "Historial" → si T401 está resuelto, lista rutas cerradas; si no, mensaje placeholder
  9. Refresco automático cada 30s (`refetchInterval`) — cambiar algo en backend → la UI lo refleja sin recargar manualmente

- [ ] T433 `npm run typecheck`, `npm run lint`, `npm run test` pasan

---

## ✅ Checkpoint 4

- 5 pantallas del despachador no usan `mockData`. Datos vienen de backend con polling 30s.
- Flujo "Despachar ahora" sobre CREADA llama `despacho-manual` antes de la pantalla de confirmación — bug del prototipo corregido.
- Exclusión de paquetes mutación inmediata vs estado local ficticio.
- Selector de tipo de vehículo en detalle convertido en display (decisión 6).
- Botón "Forzar cierre" agregado en detalle de rutas EN_TRANSITO.
- Alertas computadas en cliente desde `useRutas`. Badge sincronizado en todo el sidebar del despachador.
- `DespachadorHistorialPage` puede quedar bloqueada hasta T401 — el resto del sprint cierra sin esa pantalla.
- `AdminVehiculoDetallePage` recupera sus secciones de rutas usando `useRutas` filtrado.

---

## Orden Total de Ejecución

```
Sprint 0 — Config inicial (PLAN-00)
    └── Sprint 1 — Auth y rutas protegidas (PLAN-01)
            └── Sprint 2 — Servicios + React Query (PLAN-02)
                    └── Sprint 3 — Admin de flota integrado (PLAN-03)
                            └── Sprint 4 — Despachador integrado (PLAN-04)        ← Este archivo
                                    └── Sprint 5 — Conductor + offline + POD (PLAN-05)
                                            └── Sprint 6 — Limpieza final (PLAN-06)
```
