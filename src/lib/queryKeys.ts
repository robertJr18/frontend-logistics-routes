export const queryKeys = {
  vehiculos: {
    all: ["vehiculos"] as const,
    list: () => [...queryKeys.vehiculos.all, "list"] as const,
    disponibilidad: () => [...queryKeys.vehiculos.all, "disponibilidad"] as const,
  },
  conductores: {
    all: ["conductores"] as const,
    list: () => [...queryKeys.conductores.all, "list"] as const,
    historial: (id: string) => [...queryKeys.conductores.all, "historial", id] as const,
  },
  // PLAN-04 agrega: rutas, despacho, paradas
  // PLAN-05 agrega: conductor.rutaActiva
};
