import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import { vehiculoService } from "@/services/vehiculos";
import { toRutaConductor } from "@/services/mappers/ruta-conductor";
import { getDB } from "@/lib/db";
import type { Ruta } from "@/types/domain";

const CACHE_KEY = "singleton";

export function useRutaActiva() {
  const qc = useQueryClient();

  // Cuando el sync engine termina de procesar la cola, refetcheamos datos frescos
  useEffect(() => {
    const handler = () =>
      qc.invalidateQueries({ queryKey: queryKeys.conductor.rutaActiva() });
    window.addEventListener("sync:queue-processed", handler);
    return () => window.removeEventListener("sync:queue-processed", handler);
  }, [qc]);

  return useQuery({
    queryKey: queryKeys.conductor.rutaActiva(),
    queryFn: async (): Promise<Ruta | null> => {
      if (navigator.onLine) {
        try {
          const [rutaDto, vehiculos] = await Promise.all([
            miRutaService.rutaActiva(),
            vehiculoService.listar(),
          ]);
          const ruta = rutaDto ? toRutaConductor(rutaDto, vehiculos) : null;
          // Persistir en IndexedDB para disponer offline
          const db = await getDB();
          if (ruta) {
            await db.put("rutaActiva", { data: ruta, savedAt: Date.now() }, CACHE_KEY);
          } else {
            await db.delete("rutaActiva", CACHE_KEY);
          }
          return ruta;
        } catch {
          // Red no disponible — caer a caché
        }
      }
      // Offline o error de red: servir desde IndexedDB
      const db = await getDB();
      const cached = (await db.get("rutaActiva", CACHE_KEY)) as
        | { data: Ruta }
        | undefined;
      return cached?.data ?? null;
    },
    refetchInterval: 15_000,
    staleTime: 0,
  });
}
