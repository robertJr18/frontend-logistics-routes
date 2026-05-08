import { api } from "./api";
import type {
  ActualizarVehiculoRequest,
  FlotaDisponibilidadResponseDto,
  VehiculoRequest,
  VehiculoResponse,
} from "@/types/dto/vehiculo";

export const vehiculoService = {
  listar: () => api.get<VehiculoResponse[]>("/api/vehiculos"),
  disponibilidad: () => api.get<FlotaDisponibilidadResponseDto[]>("/api/vehiculos/disponibilidad"),
  registrar: (req: VehiculoRequest) => api.post<VehiculoResponse>("/api/vehiculos", req),
  actualizar: (id: string, req: ActualizarVehiculoRequest) =>
    api.put<VehiculoResponse>(`/api/vehiculos/${id}`, req),
  darDeBaja: (id: string) => api.delete<void>(`/api/vehiculos/${id}`),
};
