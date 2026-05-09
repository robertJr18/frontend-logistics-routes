import type { TipoVehiculoDto } from "./vehiculo";
import type { ParadaResponse } from "./parada";

export type EstadoRutaDto =
  | "CREADA"
  | "LISTA_PARA_DESPACHO"
  | "CONFIRMADA"
  | "EN_TRANSITO"
  | "CERRADA_MANUAL"
  | "CERRADA_AUTOMATICA"
  | "CERRADA_FORZADA";

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
