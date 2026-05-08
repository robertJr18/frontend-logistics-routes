import { api } from "./api";
import type { ConductorResponse } from "@/types/dto/conductor";

// PR-03a expone únicamente `listar()` — necesario para resolver `conductorId → nombre`
// dentro del mapper de vehiculo. PR-03b agrega registrar, asignar, desvincular,
// darDeBaja, historial.
export const conductorService = {
  listar: () => api.get<ConductorResponse[]>("/api/conductores"),
};
