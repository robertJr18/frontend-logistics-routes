import { api } from "./api";
import type { RutaResponse } from "@/types/dto/ruta";

export const rutaService = {
  listarActivas: () => api.get<RutaResponse[]>("/api/despacho/rutas/activas"),
  listarHistorial: () => api.get<RutaResponse[]>("/api/despacho/rutas/historial"),
};
