import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";

export function useAsignarVehiculoConductor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conductorId, vehiculoId }: { conductorId: string; vehiculoId: string }) =>
      conductorService.asignarVehiculo(conductorId, { vehiculoId }),
    onSuccess: () => {
      // La asignación afecta el estado de ambos lados.
      qc.invalidateQueries({ queryKey: queryKeys.conductores.all });
      qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all });
    },
  });
}
