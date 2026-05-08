import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";
import type { RegistrarConductorRequest } from "@/types/dto/conductor";

export function useRegistrarConductor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: RegistrarConductorRequest) => conductorService.registrar(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.conductores.all }),
  });
}
