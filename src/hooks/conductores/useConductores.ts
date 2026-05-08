import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";
import { vehiculoService } from "@/services/vehiculos";
import { toConductor } from "@/services/mappers/conductor";

export function useConductores() {
  return useQuery({
    queryKey: queryKeys.conductores.list(),
    queryFn: async () => {
      const [conductores, vehiculos] = await Promise.all([
        conductorService.listar(),
        vehiculoService.listar(),
      ]);
      return conductores.map((c) => toConductor(c, vehiculos));
    },
  });
}
