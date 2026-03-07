// ===== TYPES =====

export type RouteStatus = "En Espera" | "Lista para Despacho" | "Ruta Confirmada" | "En Tránsito" | "Cerrada";
export type StopStatus = "Pendiente" | "Exitosa" | "Fallida" | "Novedad";
export type VehicleType = "Moto" | "Van" | "NHR" | "Turbo";
export type VehicleStatus = "Disponible" | "En Tránsito" | "Inactivo";
export type DriverStatus = "Activo" | "Inactivo";

export interface Paquete {
  id: string;
  peso: number;
  direccion: string;
  fechaLimiteEntrega: string;
  tipoPaquete: string;
}

export interface Parada {
  numero: number;
  paqueteId: string;
  direccion: string;
  destinatario: string;
  status: StopStatus;
  motivoFallo?: string;
  tipoNovedad?: string;
}

export interface Ruta {
  id: string;
  zona: string;
  paquetes: Paquete[];
  vehiculoRequerido: VehicleType;
  estado: RouteStatus;
  fechaCreacion: string;
  fechaLimiteDespacho: string;
  vehiculoAsignado?: string;
  conductorAsignado?: string;
  paradas: Parada[];
  resumen?: { exitosas: number; fallidas: number; novedades: number; total: number };
}

export interface Vehiculo {
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

export interface HistorialAsignacion {
  conductor: string;
  vehiculo: string;
  fechaInicio: string;
  fechaFin: string | null;
}

// ===== MOCK DATA =====

export const conductores: Conductor[] = [
  { id: "DRV-001", nombre: "Carlos Martínez", estado: "Activo", vehiculoAsignado: "ABC-123", turnoActivo: "06:00 - 14:00" },
  { id: "DRV-002", nombre: "Juliana Ospina", estado: "Activo", vehiculoAsignado: "XYZ-456", turnoActivo: "06:00 - 14:00" },
  { id: "DRV-003", nombre: "Andrés Pérez", estado: "Activo", vehiculoAsignado: null, turnoActivo: "14:00 - 22:00" },
  { id: "DRV-004", nombre: "María Camila Torres", estado: "Activo", vehiculoAsignado: "PQR-321", turnoActivo: "06:00 - 14:00" },
  { id: "DRV-005", nombre: "Diego Hernández", estado: "Inactivo", vehiculoAsignado: null, turnoActivo: null },
];

export const vehiculos: Vehiculo[] = [
  { placa: "ABC-123", tipo: "Van", modelo: "Chevrolet N300", capacidadPeso: 500, volumenMax: 4.2, zona: "Pescaito", estado: "En Tránsito", conductorAsignado: "Carlos Martínez" },
  { placa: "XYZ-456", tipo: "NHR", modelo: "Chevrolet NHR", capacidadPeso: 2000, volumenMax: 12, zona: "Centro Histórico", estado: "En Tránsito", conductorAsignado: "Juliana Ospina" },
  { placa: "MNO-789", tipo: "Moto", modelo: "AKT TT 150", capacidadPeso: 20, volumenMax: 0.3, zona: "Rodadero", estado: "Disponible", conductorAsignado: null },
  { placa: "PQR-321", tipo: "Van", modelo: "Renault Kangoo", capacidadPeso: 500, volumenMax: 3.8, zona: "Mamatoco", estado: "Disponible", conductorAsignado: "María Camila Torres" },
  { placa: "LKJ-654", tipo: "Turbo", modelo: "Hino Dutro", capacidadPeso: 4500, volumenMax: 20, zona: "Bastidas", estado: "Disponible", conductorAsignado: null },
  { placa: "DEF-987", tipo: "NHR", modelo: "JMC N900", capacidadPeso: 2000, volumenMax: 10, zona: "El Pando", estado: "Inactivo", conductorAsignado: null },
  { placa: "GHI-111", tipo: "Van", modelo: "Hafei Ruiyi", capacidadPeso: 450, volumenMax: 3.5, zona: "Gaira", estado: "Disponible", conductorAsignado: null },
];

export const rutas: Ruta[] = [
  {
    id: "RT-001",
    zona: "Pescaito",
    vehiculoRequerido: "Van",
    estado: "Lista para Despacho",
    fechaCreacion: "2026-03-05",
    fechaLimiteDespacho: "2026-03-07 08:00",
    paradas: [],
    paquetes: [
      { id: "PKG-001", peso: 12, direccion: "Cra 5 #22-18, Pescaito", fechaLimiteEntrega: "2026-03-07", tipoPaquete: "Estándar" },
      { id: "PKG-002", peso: 8, direccion: "Calle 10 #3-15, Pescaito", fechaLimiteEntrega: "2026-03-07", tipoPaquete: "Frágil" },
      { id: "PKG-003", peso: 15, direccion: "Av. del Río #8-45, Pescaito", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Estándar" },
      { id: "PKG-004", peso: 6, direccion: "Cra 3 #18-22, Pescaito", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Estándar" },
      { id: "PKG-005", peso: 20, direccion: "Calle 8 #5-10, Pescaito", fechaLimiteEntrega: "2026-03-09", tipoPaquete: "Voluminoso" },
    ],
  },
  {
    id: "RT-002",
    zona: "Centro Histórico",
    vehiculoRequerido: "NHR",
    estado: "Lista para Despacho",
    fechaCreacion: "2026-03-05",
    fechaLimiteDespacho: "2026-03-07 10:00",
    paradas: [],
    paquetes: [
      { id: "PKG-006", peso: 25, direccion: "Cra 2 #14-30, Centro Histórico", fechaLimiteEntrega: "2026-03-07", tipoPaquete: "Estándar" },
      { id: "PKG-007", peso: 45, direccion: "Calle 16 #4-55, Centro Histórico", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Frágil" },
      { id: "PKG-008", peso: 18, direccion: "Cra 1 #20-12, Centro Histórico", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Estándar" },
    ],
  },
  {
    id: "RT-003",
    zona: "Rodadero",
    vehiculoRequerido: "Van",
    estado: "En Tránsito",
    fechaCreacion: "2026-03-04",
    fechaLimiteDespacho: "2026-03-06 07:00",
    vehiculoAsignado: "ABC-123",
    conductorAsignado: "Carlos Martínez",
    paquetes: [
      { id: "PKG-040", peso: 10, direccion: "Calle 30 #14-62, Rodadero", fechaLimiteEntrega: "2026-03-07", tipoPaquete: "Estándar" },
      { id: "PKG-041", peso: 5, direccion: "Cra 1 #7-60, Rodadero", fechaLimiteEntrega: "2026-03-07", tipoPaquete: "Frágil" },
      { id: "PKG-012", peso: 14, direccion: "Av. Tamacá #2-30, Rodadero", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Estándar" },
      { id: "PKG-013", peso: 22, direccion: "Calle 28 #6-18, Rodadero", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Voluminoso" },
    ],
    paradas: [
      { numero: 1, paqueteId: "PKG-040", direccion: "Calle 30 #14-62, Rodadero", destinatario: "Paola Rincón", status: "Exitosa" },
      { numero: 2, paqueteId: "PKG-041", direccion: "Cra 1 #7-60, Rodadero", destinatario: "Jorge Pedraza", status: "Pendiente" },
      { numero: 3, paqueteId: "PKG-012", direccion: "Av. Tamacá #2-30, Rodadero", destinatario: "Luz Díaz", status: "Fallida", motivoFallo: "Cliente ausente" },
      { numero: 4, paqueteId: "PKG-013", direccion: "Calle 28 #6-18, Rodadero", destinatario: "Camilo Suárez", status: "Pendiente" },
    ],
  },
  {
    id: "RT-004",
    zona: "Mamatoco",
    vehiculoRequerido: "Moto",
    estado: "En Espera",
    fechaCreacion: "2026-03-06",
    fechaLimiteDespacho: "2026-03-08 09:00",
    paradas: [],
    paquetes: [
      { id: "PKG-014", peso: 3, direccion: "Cra 19 #41-10, Mamatoco", fechaLimiteEntrega: "2026-03-09", tipoPaquete: "Estándar" },
      { id: "PKG-015", peso: 2, direccion: "Calle 35 #20-05, Mamatoco", fechaLimiteEntrega: "2026-03-09", tipoPaquete: "Estándar" },
    ],
  },
  {
    id: "RT-005",
    zona: "Bastidas",
    vehiculoRequerido: "Van",
    estado: "Cerrada",
    fechaCreacion: "2026-03-01",
    fechaLimiteDespacho: "2026-03-03 08:00",
    vehiculoAsignado: "PQR-321",
    conductorAsignado: "María Camila Torres",
    paquetes: [
      { id: "PKG-020", peso: 10, direccion: "Diagonal 22 #5-33, Bastidas", fechaLimiteEntrega: "2026-03-04", tipoPaquete: "Estándar" },
      { id: "PKG-021", peso: 7, direccion: "Cra 15 #30-18, Bastidas", fechaLimiteEntrega: "2026-03-04", tipoPaquete: "Frágil" },
      { id: "PKG-022", peso: 12, direccion: "Calle 25 #12-44, Bastidas", fechaLimiteEntrega: "2026-03-04", tipoPaquete: "Estándar" },
    ],
    paradas: [
      { numero: 1, paqueteId: "PKG-020", direccion: "Diagonal 22 #5-33, Bastidas", destinatario: "Ana Morales", status: "Exitosa" },
      { numero: 2, paqueteId: "PKG-021", direccion: "Cra 15 #30-18, Bastidas", destinatario: "Ricardo Vega", status: "Exitosa" },
      { numero: 3, paqueteId: "PKG-022", direccion: "Calle 25 #12-44, Bastidas", destinatario: "Sandra López", status: "Novedad", tipoNovedad: "Paquete dañado" },
    ],
    resumen: { exitosas: 2, fallidas: 0, novedades: 1, total: 3 },
  },
  {
    id: "RT-006",
    zona: "El Pando",
    vehiculoRequerido: "Turbo",
    estado: "Lista para Despacho",
    fechaCreacion: "2026-03-06",
    fechaLimiteDespacho: "2026-03-07 14:00",
    paradas: [],
    paquetes: [
      { id: "PKG-030", peso: 120, direccion: "Calle 11 #3-20, El Pando", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Voluminoso" },
      { id: "PKG-031", peso: 80, direccion: "Cra 7 #9-14, El Pando", fechaLimiteEntrega: "2026-03-08", tipoPaquete: "Estándar" },
      { id: "PKG-032", peso: 200, direccion: "Av. del Ferrocarril #15-40, El Pando", fechaLimiteEntrega: "2026-03-09", tipoPaquete: "Estándar" },
      { id: "PKG-033", peso: 55, direccion: "Calle 13 #2-28, El Pando", fechaLimiteEntrega: "2026-03-09", tipoPaquete: "Frágil" },
      { id: "PKG-034", peso: 150, direccion: "Cra 5 #11-55, El Pando", fechaLimiteEntrega: "2026-03-09", tipoPaquete: "Voluminoso" },
      { id: "PKG-035", peso: 90, direccion: "Calle 10 #6-32, El Pando", fechaLimiteEntrega: "2026-03-10", tipoPaquete: "Estándar" },
    ],
  },
];

export const historialAsignaciones: HistorialAsignacion[] = [
  { conductor: "Carlos Martínez", vehiculo: "ABC-123", fechaInicio: "2026-02-15", fechaFin: "2026-03-01" },
  { conductor: "Juliana Ospina", vehiculo: "MNO-789", fechaInicio: "2026-02-20", fechaFin: "2026-03-05" },
  { conductor: "María Camila Torres", vehiculo: "GHI-111", fechaInicio: "2026-03-01", fechaFin: "2026-03-04" },
];

export const zonasSantaMarta = [
  "Centro Histórico",
  "Pescaito",
  "Rodadero",
  "Mamatoco",
  "Bastidas",
  "El Pando",
  "Gaira",
  "Taganga",
];
