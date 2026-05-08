import type {
  DriverStatus,
  ModeloContrato,
  RouteStatus,
  StopStatus,
  VehicleStatus,
  VehicleType,
} from "@/types/domain";

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

export function formatTipoVehiculo(dto: string): VehicleType {
  const map: Record<string, VehicleType> = {
    MOTO: "Moto",
    VAN: "Van",
    NHR: "NHR",
    TURBO: "Turbo",
  };
  return map[dto] ?? "Moto";
}

export function tipoVehiculoToDto(ui: VehicleType): "MOTO" | "VAN" | "NHR" | "TURBO" {
  const map: Record<VehicleType, "MOTO" | "VAN" | "NHR" | "TURBO"> = {
    Moto: "MOTO",
    Van: "VAN",
    NHR: "NHR",
    Turbo: "TURBO",
  };
  return map[ui];
}

export function formatModeloContrato(dto: string): ModeloContrato {
  return dto === "RECORRIDO_COMPLETO" ? "Recorrido completo" : "Por parada";
}

export function modeloContratoToDto(ui: ModeloContrato): "RECORRIDO_COMPLETO" | "POR_PARADA" {
  return ui === "Recorrido completo" ? "RECORRIDO_COMPLETO" : "POR_PARADA";
}
