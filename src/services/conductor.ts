import { api } from "./api";
import type { CierreRutaRequest, RegistrarParadaRequest } from "@/types/dto/parada";
import type { RutaConductorResponseDto, SubirFotoResponse } from "@/types/dto/conductor-operacion";

export const miRutaService = {
  rutaActiva: () => api.get<RutaConductorResponseDto | undefined>("/api/conductor/ruta-activa"),
  iniciarRuta: (rutaId: string) =>
    api.post<void>(`/api/conductor/rutas/${rutaId}/iniciar-transito`),
  registrarParada: (paradaId: string, req: RegistrarParadaRequest) =>
    api.post<void>(`/api/conductor/paradas/${paradaId}/registrar`, req),
  cerrarRuta: (rutaId: string, req: CierreRutaRequest) =>
    api.post<void>(`/api/conductor/rutas/${rutaId}/cerrar`, req),
  subirFoto: async (paradaId: string, archivo: Blob): Promise<SubirFotoResponse> => {
    // Multipart no pasa por el wrapper api (que fija Content-Type: application/json).
    // Llamada directa con fetch + Authorization manual.
    const token = localStorage.getItem("auth.token");
    const form = new FormData();
    form.append("archivo", archivo, `${paradaId}.jpg`);
    const baseUrl = import.meta.env.VITE_API_URL ?? "";
    const res = await fetch(`${baseUrl}/api/conductor/paradas/${paradaId}/foto`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  },
};
