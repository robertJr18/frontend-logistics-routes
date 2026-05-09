import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { despachoService } from "@/services/despacho";

export function useExcluirPaquete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rutaId, paqueteId }: { rutaId: string; paqueteId: string }) =>
      despachoService.excluirPaquete(rutaId, paqueteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.rutas.all }),
  });
}
