import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";

export function useIniciarRuta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rutaId: string) => miRutaService.iniciarRuta(rutaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conductor.all });
      qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
    },
  });
}
