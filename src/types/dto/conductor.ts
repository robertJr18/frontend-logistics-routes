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

export interface AsignacionRequest {
  vehiculoId: string;
}

export interface HistorialAsignacionResponse {
  id: string;
  conductorId: string;
  vehiculoId: string;
  fechaHoraInicio: string;
  fechaHoraFin: string | null;
  activo: boolean;
}
