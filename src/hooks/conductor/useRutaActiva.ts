import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import { vehiculoService } from "@/services/vehiculos";
import { toRutaConductor } from "@/services/mappers/ruta-conductor";

/**
 * Lee la ruta activa del conductor.
 * El backend retorna 204 (sin body) cuando no hay ruta — `api.ts` lo convierte
 * en `undefined`, así que mapeamos a `null` antes de pasarlo al UI.
 */
export function useRutaActiva() {
  return useQuery({
    queryKey: queryKeys.conductor.rutaActiva(),
    queryFn: async () => {
      const [rutaDto, vehiculos] = await Promise.all([
        miRutaService.rutaActiva(),
        vehiculoService.listar(),
      ]);
      if (!rutaDto) return null;
      return toRutaConductor(rutaDto, vehiculos);
    },
    refetchInterval: 15_000,
  });
}
