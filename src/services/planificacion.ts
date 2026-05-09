import { api } from "./api";

export const planificacionService = {
  confirmarParaDespacho: (rutaId: string) =>
    api.post<void>(`/api/planificacion/rutas/${rutaId}/confirmar`),
};
