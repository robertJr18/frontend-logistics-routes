import { formatRouteStatus, formatTipoVehiculo } from "@/lib/formatters";
import { geohashToLabel } from "@/lib/zonas";
import type { Ruta } from "@/types/domain";
import type { ConductorResponse } from "@/types/dto/conductor";
import type { RutaResponse } from "@/types/dto/ruta";
import type { VehiculoResponse } from "@/types/dto/vehiculo";
import { toParada } from "./parada";

export function toRuta(
  dto: RutaResponse,
  vehiculos: VehiculoResponse[] = [],
  conductores: ConductorResponse[] = [],
): Ruta {
  const vehiculo = dto.vehiculoId ? vehiculos.find((v) => v.id === dto.vehiculoId) : null;
  const conductor = dto.conductorId ? conductores.find((c) => c.id === dto.conductorId) : null;

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
    pesoTotal: dto.pesoAcumuladoKg,
    vehiculoRequerido: formatTipoVehiculo(dto.tipoVehiculoRequerido),
    estado: formatRouteStatus(dto.estado),
    fechaCreacion: dto.fechaCreacionRuta,
    fechaLimiteDespacho: dto.fechaLimiteDespacho,
    motivoDespacho: dto.motivoDespacho ?? undefined,
    vehiculoAsignado: vehiculo?.placa,
    conductorAsignado: conductor?.nombre,
    fechaCierre: dto.fechaHoraCierre ?? undefined,
    paradas: dto.paradas.map(toParada),
    resumen: {
      exitosas: dto.paradas.filter((p) => p.estado === "EXITOSA").length,
      fallidas: dto.paradas.filter((p) => p.estado === "FALLIDA").length,
      novedades: dto.paradas.filter((p) => p.estado === "NOVEDAD").length,
      sinGestion: dto.paradas.filter((p) => p.estado === "SIN_GESTION_CONDUCTOR").length,
      total: dto.paradas.length,
    },
  };
}
