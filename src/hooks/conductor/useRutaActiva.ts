import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import { vehiculoService } from "@/services/vehiculos";
import { toRuta } from "@/services/mappers/ruta";
import { ApiError } from "@/services/api";

export function useRutaActiva() {
  return useQuery({
    queryKey: queryKeys.conductor.rutaActiva(),
    queryFn: async () => {
      try {
        const [rutaDto, vehiculos] = await Promise.all([
          miRutaService.rutaActiva(),
          vehiculoService.listar(),
        ]);
        return toRuta(rutaDto, vehiculos, []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    refetchInterval: 15_000,
  });
}
