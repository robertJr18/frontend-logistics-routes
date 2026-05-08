import { api } from "./api";
import type { RutaResponse } from "@/types/dto/ruta";
import type { GestionarParadaRequest } from "@/types/dto/parada";

export const miRutaService = {
  rutaActiva: () => api.get<RutaResponse>("/api/conductor/ruta-activa"),
  iniciarRuta: (rutaId: string) =>
    api.post<void>(`/api/conductor/rutas/${rutaId}/iniciar`, {}),
  gestionarParada: (paradaId: string, req: GestionarParadaRequest) =>
    api.post<void>(`/api/conductor/paradas/${paradaId}/gestionar`, req),
  cerrarRuta: (rutaId: string) =>
    api.post<void>(`/api/conductor/rutas/${rutaId}/cerrar`, {}),
};
