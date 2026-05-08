import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { vehiculoService } from "@/services/vehiculos";
import type { ActualizarVehiculoRequest } from "@/types/dto/vehiculo";

export function useActualizarVehiculo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: ActualizarVehiculoRequest }) =>
      vehiculoService.actualizar(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all }),
  });
}
