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

export interface GestionarParadaRequest {
  tipo: "EXITOSA" | "FALLIDA" | "NOVEDAD";
  motivoNovedad?: MotivoNovedadDto;
  nombreReceptor?: string;
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
