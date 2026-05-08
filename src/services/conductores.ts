import { api } from "./api";
import type {
  AsignacionRequest,
  ConductorResponse,
  HistorialAsignacionResponse,
  RegistrarConductorRequest,
} from "@/types/dto/conductor";

export const conductorService = {
  listar: () => api.get<ConductorResponse[]>("/api/conductores"),
  registrar: (req: RegistrarConductorRequest) =>
    api.post<ConductorResponse>("/api/conductores", req),
  asignarVehiculo: (id: string, req: AsignacionRequest) =>
    api.post<ConductorResponse>(`/api/conductores/${id}/asignacion`, req),
  desvincularVehiculo: (id: string) =>
    api.delete<void>(`/api/conductores/${id}/asignacion`),
  darDeBaja: (id: string) => api.delete<void>(`/api/conductores/${id}`),
  historial: (id: string) =>
    api.get<HistorialAsignacionResponse[]>(`/api/conductores/${id}/historial`),
};
