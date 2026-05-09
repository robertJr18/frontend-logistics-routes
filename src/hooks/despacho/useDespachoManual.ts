import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { despachoService } from "@/services/despacho";

export function useDespachoManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rutaId: string) => despachoService.marcarListaParaDespacho(rutaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.rutas.all }),
  });
}
