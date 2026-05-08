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
