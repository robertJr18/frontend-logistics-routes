import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { conductorService } from "@/services/conductores";

export function useHistorialConductor(conductorId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.conductores.historial(conductorId ?? ""),
    queryFn: () => conductorService.historial(conductorId!),
    enabled: !!conductorId,
  });
}
