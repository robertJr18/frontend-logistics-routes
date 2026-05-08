import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { vehiculoService } from "@/services/vehiculos";

export function useDarDeBajaVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiculoService.darDeBaja(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all }),
  });
}
