import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { despachoService } from "@/services/despacho";

export function useForzarCierreRuta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rutaId: string) => despachoService.forzarCierre(rutaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
      qc.invalidateQueries({ queryKey: queryKeys.vehiculos.all });
      qc.invalidateQueries({ queryKey: queryKeys.conductores.all });
    },
  });
}
