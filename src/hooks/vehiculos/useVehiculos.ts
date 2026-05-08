import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";
import { vehiculoService } from "@/services/vehiculos";
import { toVehiculo } from "@/services/mappers/vehiculo";

export function useVehiculos() {
  return useQuery({
    queryKey: queryKeys.vehiculos.list(),
    queryFn: async () => {
      const [vehiculos, conductores] = await Promise.all([
        vehiculoService.listar(),
        conductorService.listar(),
      ]);
      return vehiculos.map((v) => toVehiculo(v, conductores));
    },
  });
}
