import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { planificacionService } from "@/services/planificacion";

export function useDespachoManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rutaId: string) => planificacionService.confirmarParaDespacho(rutaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.rutas.all }),
  });
}
