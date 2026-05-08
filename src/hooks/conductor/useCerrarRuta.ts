import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";

export function useCerrarRuta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rutaId: string) => miRutaService.cerrarRuta(rutaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conductor.all });
      qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
    },
  });
}
