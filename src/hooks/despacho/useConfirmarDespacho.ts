import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { despachoService } from "@/services/despacho";
import type { ConfirmarDespachoRequest } from "@/types/dto/ruta";

export function useConfirmarDespacho() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rutaId, req }: { rutaId: string; req: ConfirmarDespachoRequest }) =>
      despachoService.confirmar(rutaId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
      qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all });
      qc.invalidateQueries({ queryKey: queryKeys.conductores.all });
    },
  });
}
