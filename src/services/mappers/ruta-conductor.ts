import { formatRouteStatus, formatStopStatus, formatTipoVehiculo } from "@/lib/formatters";
import { geohashToLabel } from "@/lib/zonas";
import type { Ruta, Parada } from "@/types/domain";
import type {
  ParadaConductorItemDto,
  RutaConductorResponseDto,
} from "@/types/dto/conductor-operacion";
import type { VehiculoResponse } from "@/types/dto/vehiculo";

/**
 * Convierte el DTO específico del conductor (`RutaConductorResponseDto`)
 * al tipo UI `Ruta`. Distinto al `toRuta` general porque el shape del backend
 * es más reducido (sin pesoAcumuladoKg, sin motivoDespacho, etc.) pero las
 * paradas tienen más detalle (nombreReceptor, tipoMercancia, etc.).
 */
export function toRutaConductor(
  dto: RutaConductorResponseDto,
  vehiculos: VehiculoResponse[] = [],
): Ruta {
  const vehiculo = dto.vehiculoId ? vehiculos.find((v) => v.id === dto.vehiculoId) : null;
  const pesoTotal = vehiculo?.capacidadPesoKg ?? 0;

  return {
    id: dto.id,
    zona: geohashToLabel(dto.zona),
    ciudad: "",
    paquetes: dto.paradas.map((p) => ({
      id: p.paqueteId,
      direccion: p.direccion,
      zona: geohashToLabel(dto.zona),
      fechaLimiteEntrega: p.fechaLimiteEntrega ?? "",
      tipoPaquete: p.tipoMercancia ?? "ESTANDAR",
    })),
    pesoTotal,
    vehiculoRequerido: formatTipoVehiculo(dto.tipoVehiculoRequerido),
    estado: formatRouteStatus(dto.estado),
    fechaCreacion: dto.fechaHoraInicio ?? dto.fechaLimiteDespacho,
    fechaLimiteDespacho: dto.fechaLimiteDespacho,
    vehiculoAsignado: vehiculo?.placa,
    paradas: dto.paradas.map(toParadaConductor),
  };
}

function toParadaConductor(dto: ParadaConductorItemDto, indice: number): Parada {
  return {
    id: dto.id,
    numero: dto.orden || indice + 1,
    paqueteId: dto.paqueteId,
    direccion: dto.direccion,
    destinatario: dto.nombreReceptor ?? "—",
    status: formatStopStatus(dto.estado),
    motivoFallo: dto.motivoNovedad ?? undefined,
  };
}
