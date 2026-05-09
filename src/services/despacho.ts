import { api } from "./api";
import type { ConfirmarDespachoRequest, RutaResponse } from "@/types/dto/ruta";

const MOTIVO_EXCLUSION_DEFAULT = "Excluido por despachador";

export const despachoService = {
  listarParaDespacho: () => api.get<RutaResponse[]>("/api/despacho/rutas"),
  marcarListaParaDespacho: (rutaId: string) =>
    api.post<RutaResponse>(`/api/despacho/rutas/${rutaId}/listar-para-despacho`),
  confirmar: (rutaId: string, req: ConfirmarDespachoRequest) =>
    api.post<RutaResponse>(`/api/despacho/rutas/${rutaId}/confirmar`, req),
  excluirPaquete: (rutaId: string, paqueteId: string, motivo = MOTIVO_EXCLUSION_DEFAULT) =>
    api.delete<void>(
      `/api/despacho/rutas/${rutaId}/paquetes/${paqueteId}?motivo=${encodeURIComponent(motivo)}`,
    ),
  forzarCierre: (rutaId: string) => api.post<void>(`/api/despacho/rutas/${rutaId}/forzar-cierre`),
};
