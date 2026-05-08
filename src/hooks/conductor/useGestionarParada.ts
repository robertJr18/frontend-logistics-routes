import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import type { GestionarParadaRequest } from "@/types/dto/parada";

export function useGestionarParada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paradaId, req }: { paradaId: string; req: GestionarParadaRequest }) =>
      miRutaService.gestionarParada(paradaId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conductor.all });
      qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
    },
  });
}
