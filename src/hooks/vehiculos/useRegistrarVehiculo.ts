import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { vehiculoService } from "@/services/vehiculos";
import type { VehiculoRequest } from "@/types/dto/vehiculo";

export function useRegistrarVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: VehiculoRequest) => vehiculoService.registrar(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all }),
  });
}
