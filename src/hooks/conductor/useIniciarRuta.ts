import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import { getDB } from "@/lib/db";
import { enqueue } from "@/lib/syncQueue";
import type { Ruta, RouteStatus } from "@/types/domain";

export function useIniciarRuta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rutaId: string) => {
      if (navigator.onLine) {
        return miRutaService.iniciarRuta(rutaId);
      }
      // Offline: encolar y actualizar estado localmente
      await enqueue("INICIAR_RUTA", { rutaId });
      qc.setQueryData<Ruta | null>(queryKeys.conductor.rutaActiva(), (old) => {
        if (!old) return old;
        const updated: Ruta = { ...old, estado: "En Tránsito" as RouteStatus };
        getDB()
          .then((db) =>
            db.put("rutaActiva", { data: updated, savedAt: Date.now() }, "singleton"),
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
