import type { RouteStatus, StopStatus, VehicleStatus, DriverStatus } from "@/types/domain";

export function formatRouteStatus(dto: string): RouteStatus {
  const map: Record<string, RouteStatus> = {
    CREADA: "Creada",
    LISTA_PARA_DESPACHO: "Lista para Despacho",
    CONFIRMADA: "Confirmada",
    EN_TRANSITO: "En Tránsito",
    CERRADA_MANUAL: "Cerrada Manual",
    CERRADA_AUTOMATICA: "Cerrada Automática",
    CERRADA_FORZADA: "Cerrada Forzada",
  };
  return map[dto] ?? "Creada";
}

export function formatVehicleStatus(dto: string): VehicleStatus {
  const map: Record<string, VehicleStatus> = {
    DISPONIBLE: "Disponible",
    EN_TRANSITO: "En Tránsito",
    INACTIVO: "Inactivo",
  };
  return map[dto] ?? "Inactivo";
}

export function formatDriverStatus(dto: string): DriverStatus {
  const map: Record<string, DriverStatus> = {
    ACTIVO: "Activo",
    INACTIVO: "Inactivo",
    EN_RUTA: "Activo",
  };
  return map[dto] ?? "Inactivo";
}

export function formatStopStatus(dto: string): StopStatus {
  const map: Record<string, StopStatus> = {
    PENDIENTE: "Pendiente",
    EXITOSA: "Exitosa",
    FALLIDA: "Fallida",
    NOVEDAD: "Novedad",
    SIN_GESTION_CONDUCTOR: "Pendiente",
    EXCLUIDA_DESPACHO: "Pendiente",
  };
  return map[dto] ?? "Pendiente";
}
