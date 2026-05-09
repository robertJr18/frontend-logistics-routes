import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import { getDB } from "@/lib/db";
import { enqueue } from "@/lib/syncQueue";
import type { RegistrarParadaRequest } from "@/types/dto/parada";
import type { Ruta, StopStatus } from "@/types/domain";

/**
 * Mutación para registrar el resultado de una parada (EXITOSA / FALLIDA / NOVEDAD).
 *
 * Online:
 *   - Si se pasa `fotoBlob`, lo sube primero a /api/conductor/paradas/{id}/foto.
 *   - Luego llama POST /api/conductor/paradas/{id}/registrar con la URL obtenida.
 *
 * Offline:
 *   - Persiste `fotoBlob` en IndexedDB ("fotosPendientes").
 *   - Encola la acción en "actionQueue".
 *   - Actualiza optimistamente el estado de la parada en el cache de React Query
 *     y en IndexedDB para que las pantallas reflejen el cambio sin conexión.
 */
export function useRegistrarParada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      paradaId,
      req,
      fotoBlob,
    }: {
      paradaId: string;
      req: RegistrarParadaRequest;
      fotoBlob?: Blob;
    }) => {
      if (navigator.onLine) {
        let fotoUrl = req.fotoUrl;
        if (fotoBlob && !fotoUrl) {
          const res = await miRutaService.subirFoto(paradaId, fotoBlob);
          fotoUrl = res.url;
        }
        return miRutaService.registrarParada(paradaId, { ...req, fotoUrl });
      }
      // Offline: persistir blob y encolar
      const db = await getDB();
      if (fotoBlob) {
        await db.put("fotosPendientes", { paradaId, blob: fotoBlob, createdAt: Date.now() });
      }
      await enqueue("REGISTRAR_PARADA", { paradaId, req });
      // Actualización optimista en memoria y en IndexedDB
      const newStatus: StopStatus =
        req.tipo === "EXITOSA" ? "Exitosa" : req.tipo === "FALLIDA" ? "Fallida" : "Novedad";
      qc.setQueryData<Ruta | null>(queryKeys.conductor.rutaActiva(), (old) => {
        if (!old) return old;
        const updated: Ruta = {
          ...old,
          paradas: old.paradas.map((p) =>
            p.id === paradaId ? { ...p, status: newStatus } : p,
          ),
        };
        getDB()
          .then((d) =>
            d.put("rutaActiva", { data: updated, savedAt: Date.now() }, "singleton"),
          )
          .catch(() => {});
        return updated;
      });
    },
    onSuccess: () => {
      if (navigator.onLine) {
        qc.invalidateQueries({ queryKey: queryKeys.conductor.all });
        qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
      }
    },
  });
}

export const useGestionarParada = useRegistrarParada;
