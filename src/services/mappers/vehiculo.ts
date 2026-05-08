import { formatTipoVehiculo, formatVehicleStatus, tipoVehiculoToDto } from "@/lib/formatters";
import { geohashToLabel, labelToGeohash } from "@/lib/zonas";
import type { Vehiculo, VehicleType } from "@/types/domain";
import type { ConductorResponse } from "@/types/dto/conductor";
import type {
  ActualizarVehiculoRequest,
  VehiculoRequest,
  VehiculoResponse,
} from "@/types/dto/vehiculo";

export function toVehiculo(
  dto: VehiculoResponse,
  conductores: ConductorResponse[] = [],
): Vehiculo {
  const conductor = dto.conductorId
    ? conductores.find((c) => c.id === dto.conductorId)
    : null;

  return {
    id: dto.id,
    placa: dto.placa,
    tipo: formatTipoVehiculo(dto.tipo),
    modelo: dto.modelo,
    capacidadPeso: dto.capacidadPesoKg,
    volumenMax: dto.volumenMaximoM3,
    zona: geohashToLabel(dto.zonaOperacion),
    estado: formatVehicleStatus(dto.estado),
    conductorAsignado: conductor?.nombre ?? null,
  };
}

export interface VehiculoFormInput {
  placa: string;
  tipo: VehicleType;
  modelo: string;
  capacidad: number;
  volumen: number;
  zonaLabel: string;
}

export function toVehiculoRequest(form: VehiculoFormInput): VehiculoRequest {
  const geohash = labelToGeohash(form.zonaLabel);
  if (!geohash) {
    throw new Error(`Zona no soportada: ${form.zonaLabel}`);
  }
  return {
    placa: form.placa,
    tipo: tipoVehiculoToDto(form.tipo),
    modelo: form.modelo,
    capacidadPesoKg: form.capacidad,
    volumenMaximoM3: form.volumen,
    zonaOperacion: geohash,
  };
}

export function toActualizarVehiculoRequest(
  form: VehiculoFormInput,
): ActualizarVehiculoRequest {
  const { placa: _placa, ...rest } = toVehiculoRequest(form);
  return rest;
}
