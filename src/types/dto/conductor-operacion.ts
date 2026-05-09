import type { EstadoRutaDto } from "./ruta";
import type { TipoVehiculoDto } from "./vehiculo";
import type { EstadoParadaDto, MotivoNovedadDto } from "./parada";

/**
 * Item de parada que retorna `GET /api/conductor/ruta-activa`.
 * Shape distinto a `ParadaResponse` (DespachoController) — incluye campos
 * operativos del paquete y datos del receptor.
 */
export interface ParadaConductorItemDto {
  id: string;
  paqueteId: string;
  orden: number;
  direccion: string;
  latitud: number;
  longitud: number;
  tipoMercancia: string | null;
  metodoPago: string | null;
  fechaLimiteEntrega: string | null;
  estado: EstadoParadaDto;
  motivoNovedad: MotivoNovedadDto | null;
  fechaHoraGestion: string | null;
  fotoEvidenciaUrl: string | null;
  firmaReceptorUrl: string | null;
  nombreReceptor: string | null;
}

/**
 * Response de `GET /api/conductor/ruta-activa`.
 * Shape distinto a `RutaResponse` (sin pesoAcumuladoKg, sin motivoDespacho,
 * sin fechaCreacionRuta — el conductor no necesita esos datos).
 *
 * El endpoint retorna 204 No Content cuando el conductor no tiene ruta;
 * `api.ts` lo convierte a `undefined`.
 */
export interface RutaConductorResponseDto {
  id: string;
  zona: string;
  estado: EstadoRutaDto;
  tipoVehiculoRequerido: TipoVehiculoDto;
  conductorId: string;
  vehiculoId: string;
  fechaLimiteDespacho: string;
  fechaHoraInicio: string | null;
  paradas: ParadaConductorItemDto[];
}

export interface SubirFotoResponse {
  url: string;
}
