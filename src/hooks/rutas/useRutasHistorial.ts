import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";
import { toRuta } from "@/services/mappers/ruta";
import { rutaService } from "@/services/rutas";
import { vehiculoService } from "@/services/vehiculos";

export function useRutasHistorial() {
  return useQuery({
    queryKey: queryKeys.rutas.historial(),
    queryFn: async () => {
      const [rutas, vehiculos, conductores] = await Promise.all([
        rutaService.listarHistorial(),
        vehiculoService.listar(),
        conductorService.listar(),
      ]);
      return rutas.map((r) => toRuta(r, vehiculos, conductores));
    },
    staleTime: 60_000,
  });
}
