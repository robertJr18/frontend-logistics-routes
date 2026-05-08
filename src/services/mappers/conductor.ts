import { formatModeloContrato, modeloContratoToDto } from "@/lib/formatters";
import type { Conductor, ModeloContrato } from "@/types/domain";
import type { ConductorResponse, RegistrarConductorRequest } from "@/types/dto/conductor";
import type { VehiculoResponse } from "@/types/dto/vehiculo";

export function toConductor(dto: ConductorResponse, vehiculos: VehiculoResponse[] = []): Conductor {
  const vehiculo = dto.vehiculoAsignadoId
    ? vehiculos.find((v) => v.id === dto.vehiculoAsignadoId)
    : null;
  return {
    id: dto.id,
    nombre: dto.nombre,
    email: dto.email,
    modeloContrato: formatModeloContrato(dto.modeloContrato),
    estado: dto.estado === "INACTIVO" ? "Inactivo" : "Activo",
    vehiculoAsignado: vehiculo?.placa ?? null,
  };
}

export interface ConductorFormInput {
  nombre: string;
  email: string;
  modeloContrato: ModeloContrato;
}

export function toRegistrarConductorRequest(form: ConductorFormInput): RegistrarConductorRequest {
  return {
    nombre: form.nombre.trim(),
    email: form.email.trim(),
    modeloContrato: modeloContratoToDto(form.modeloContrato),
  };
}
