import { formatStopStatus } from "@/lib/formatters";
import type { Parada } from "@/types/domain";
import type { ParadaResponse } from "@/types/dto/parada";

export function toParada(dto: ParadaResponse, indice: number): Parada {
  return {
    id: dto.id,
    numero: dto.orden || indice + 1,
    paqueteId: dto.paqueteId,
    direccion: dto.direccion,
    destinatario: dto.nombreReceptor ?? "—",
    status: formatStopStatus(dto.estado),
    motivoFallo: dto.motivoNovedad ?? undefined,
  };
}
