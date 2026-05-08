import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { vehiculoService } from "@/services/vehiculos";

export function useDisponibilidadFlota() {
  return useQuery({
    queryKey: queryKeys.vehiculos.disponibilidad(),
    queryFn: () => vehiculoService.disponibilidad(),
  });
}
