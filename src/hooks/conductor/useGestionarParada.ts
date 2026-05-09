import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { miRutaService } from "@/services/conductor";
import type { RegistrarParadaRequest } from "@/types/dto/parada";

/**
 * Mutación para registrar el resultado de una parada (EXITOSA / FALLIDA / NOVEDAD).
 * Llama `POST /api/conductor/paradas/{paradaId}/registrar` con el shape del backend
 * (incluye `fechaAccion` ISO 8601, `fotoUrl` obligatorio en EXITOSA, etc.).
 */
export function useRegistrarParada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paradaId, req }: { paradaId: string; req: RegistrarParadaRequest }) =>
      miRutaService.registrarParada(paradaId, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.conductor.all });
      qc.invalidateQueries({ queryKey: queryKeys.rutas.all });
    },
  });
}

// Alias temporal para no romper imports legacy (`useGestionarParada`).
// PLAN-06 elimina y migra todos los call sites.
export const useGestionarParada = useRegistrarParada;
