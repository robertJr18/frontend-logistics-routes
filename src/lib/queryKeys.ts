export const queryKeys = {
  vehiculos: {
    all: ["vehiculos"] as const,
    list: () => [...queryKeys.vehiculos.all, "list"] as const,
    disponibilidad: () => [...queryKeys.vehiculos.all, "disponibilidad"] as const,
  },
  // PLAN-03 agrega: conductores
  // PLAN-04 agrega: rutas, despacho, paradas
  // PLAN-05 agrega: conductor.rutaActiva
};
