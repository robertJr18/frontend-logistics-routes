export type TipoVehiculoDto = "MOTO" | "VAN" | "NHR" | "TURBO";
export type EstadoVehiculoDto = "DISPONIBLE" | "EN_TRANSITO" | "INACTIVO";

export interface VehiculoResponse {
  id: string;
  placa: string;
  tipo: TipoVehiculoDto;
  modelo: string;
  capacidadPesoKg: number;
  volumenMaximoM3: number;
  zonaOperacion: string;
  estado: EstadoVehiculoDto;
  conductorId: string | null;
}

export interface FlotaDisponibilidadResponseDto extends VehiculoResponse {
  disponibleParaPlanificacion: boolean;
}

export interface VehiculoRequest {
  placa: string;
  tipo: TipoVehiculoDto;
  modelo: string;
  capacidadPesoKg: number;
  volumenMaximoM3: number;
  zonaOperacion: string;
}

export type ActualizarVehiculoRequest = Omit<VehiculoRequest, "placa">;
