import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";

export function useDesvincularVehiculoConductor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (conductorId: string) => conductorService.desvincularVehiculo(conductorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conductores.all });
      qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all });
    },
  });
}
