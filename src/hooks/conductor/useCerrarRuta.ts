import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import { getDB } from "@/lib/db";
import { enqueue } from "@/lib/syncQueue";

export function useCerrarRuta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      rutaId,
      confirmarConPendientes,
    }: {
      rutaId: string;
      confirmarConPendientes: boolean;
    }) => {
      if (navigator.onLine) {
        return miRutaService.cerrarRuta(rutaId, { confirmarConPendientes });
      }
      // Offline: encolar cierre y limpiar caché local
      await enqueue("CERRAR_RUTA", { rutaId, confirmarConPendientes });
      qc.setQueryData(queryKeys.conductor.rutaActiva(), null);
      const db = await getDB();
      await db.delete("rutaActiva", "singleton");
    },
    onSuccess: () => {
      if (navigator.onLine) {
        qc.invalidateQueries({ queryKey: queryKeys.conductor.all });
        qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
      }
    },
  });
}
