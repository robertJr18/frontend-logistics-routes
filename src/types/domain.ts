export type RouteStatus =
  | "Creada"
  | "Lista para Despacho"
  | "Confirmada"
  | "En Tránsito"
  | "Cerrada Manual"
  | "Cerrada Automática"
  | "Cerrada Forzada";

export type StopStatus = "Pendiente" | "Exitosa" | "Fallida" | "Novedad";

export type VehicleType = "Moto" | "Van" | "NHR" | "Turbo";

export type VehicleStatus = "Disponible" | "En Tránsito" | "Inactivo";

export type DriverStatus = "Activo" | "Inactivo";

export interface Paquete {
  id: string;
  peso: number;
  direccion: string;
  zona: string;
  fechaLimiteEntrega: string;
  tipoPaquete: string;
}

export interface Parada {
  numero: number;
  paqueteId: string;
  direccion: string;
  destinatario: string;
  peso: number;
  status: StopStatus;
  motivoFallo?: string;
  tipoNovedad?: string;
}

export interface ResumenRuta {
  exitosas: number;
  fallidas: number;
  novedades: number;
  sinGestion: number;
  total: number;
}

export interface Ruta {
  id: string;
  zona: string;
  ciudad: string;
  paquetes: Paquete[];
  pesoTotal: number;
  vehiculoRequerido: VehicleType;
  estado: RouteStatus;
  fechaCreacion: string;
  fechaLimiteDespacho: string;
  motivoDespacho?: string;
  vehiculoAsignado?: string;
  conductorAsignado?: string;
  paradas: Parada[];
  resumen?: ResumenRuta;
}

export interface Vehiculo {
  id: string;
  placa: string;
  tipo: VehicleType;
  modelo: string;
  capacidadPeso: number;
  volumenMax: number;
  zona: string;
  estado: VehicleStatus;
  conductorAsignado: string | null;
}

export interface Conductor {
  id: string;
  nombre: string;
  estado: DriverStatus;
  vehiculoAsignado: string | null;
  turnoActivo: string | null;
}

// Capacidades en kg por tipo, según el backend (TipoVehiculo enum).
export const capacidadVehiculo: Record<VehicleType, number> = {
  Moto: 50,
  Van: 300,
  NHR: 1000,
  Turbo: 3000,
};
