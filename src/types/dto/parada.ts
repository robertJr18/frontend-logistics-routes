export type EstadoParadaDto =
  | "PENDIENTE"
  | "EXITOSA"
  | "FALLIDA"
  | "NOVEDAD"
  | "SIN_GESTION_CONDUCTOR"
  | "EXCLUIDA_DESPACHO";

export type MotivoNovedadDto =
  | "CLIENTE_AUSENTE"
  | "DIRECCION_INCORRECTA"
  | "ZONA_DIFICIL_ACCESO"
  | "RECHAZADO_POR_CLIENTE"
  | "DAÑADO_EN_RUTA"
  | "EXTRAVIADO"
  | "DEVOLUCION";

export type TipoResultadoParada = "EXITOSA" | "FALLIDA" | "NOVEDAD";

/**
 * Body de POST /api/conductor/paradas/{paradaId}/registrar.
 * El backend respeta `fechaAccion` del request (timestamp del cliente,
 * soporte offline — NO usa Instant.now()).
 *
 * Reglas de validación del backend:
 * - tipo: obligatorio
 * - fechaAccion: obligatorio (ISO 8601)
 * - tipo === EXITOSA → fotoUrl obligatorio (POD)
 * - tipo === FALLIDA | NOVEDAD → motivo obligatorio
 */
export interface RegistrarParadaRequest {
  tipo: TipoResultadoParada;
  fechaAccion: string;
  fotoUrl?: string;
  firmaUrl?: string;
  nombreReceptor?: string;
  motivo?: MotivoNovedadDto;
}

/** Body de POST /api/conductor/rutas/{id}/cerrar */
export interface CierreRutaRequest {
  confirmarConPendientes: boolean;
}

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
