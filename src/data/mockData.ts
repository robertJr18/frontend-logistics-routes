export interface Paquete {
  id: string;
  direccion: string;
  tipoPaquete: "Estándar" | "Frágil" | "Sobredimensionado" | "Documentos";
  peso: number;
  metodoPago: "Prepagado" | "Contra entrega" | "Crédito";
  estado: "Pendiente" | "Entregado" | "Fallido" | "Novedad";
}

export interface Parada {
  numero: number;
  paquete: Paquete;
  completada: boolean;
  resultado?: "exitosa" | "fallida" | "novedad";
  motivoFallo?: string;
}

export interface Ruta {
  id: string;
  zona: string;
  paquetes: number;
  pesoActual: number;
  pesoMax: number;
  vehiculoTipo: string;
  vehiculoPlaca: string;
  conductor: string;
  estado: "Lista para Despacho" | "En Tránsito" | "Completada" | "Con Novedades";
  paradas: Parada[];
}

export interface Vehiculo {
  placa: string;
  tipo: "Moto" | "Van" | "NHR" | "Turbo";
  modelo: string;
  capacidadPeso: number;
  volumenMax: number;
  zona: string;
  conductor: string | null;
  estado: "Disponible" | "En Tránsito" | "Inactivo";
  pesoActual: number;
}

export interface Conductor {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  disponible: boolean;
}

export const conductores: Conductor[] = [
  { id: "C001", nombre: "Juan Pérez", cedula: "1.032.456.789", telefono: "311-234-5678", disponible: false },
  { id: "C002", nombre: "María García", cedula: "52.987.654", telefono: "300-876-5432", disponible: false },
  { id: "C003", nombre: "Carlos Rodríguez", cedula: "80.123.456", telefono: "315-111-2233", disponible: true },
  { id: "C004", nombre: "Ana Martínez", cedula: "1.019.876.543", telefono: "320-444-5566", disponible: false },
  { id: "C005", nombre: "Luis Hernández", cedula: "79.654.321", telefono: "312-777-8899", disponible: true },
  { id: "C006", nombre: "Sofía López", cedula: "1.045.321.654", telefono: "318-222-3344", disponible: true },
];

const direccionesBogota = [
  "Cra 7 #45-12, Chapinero",
  "Cll 80 #23-45, Barrios Unidos",
  "Av Boyacá #68-30, Engativá",
  "Cra 15 #100-20, Usaquén",
  "Cll 53 #14-22, Teusaquillo",
  "Cra 30 #45-10, Santa Fe",
  "Cll 127 #7-35, Usaquén Norte",
  "Av NQS #63-28, Barrios Unidos",
  "Cra 68 #13-51, Kennedy",
  "Cll 170 #9-20, Toberín",
  "Tv 93 #53-45, Álamos",
  "Cra 11 #82-01, Zona G",
  "Cll 26 #69B-53, CAN",
  "Av Suba #115-30, Niza",
  "Cra 50 #127-40, Prado Veraniego",
  "Cll 72 #10-07, Quinta Camacho",
  "Dg 92 #17-45, La Castellana",
  "Cra 9 #116-20, Santa Bárbara",
  "Cll 134 #55-10, Colina Campestre",
  "Cra 24 #39-80, La Soledad",
];

function crearParadas(zona: string, count: number): Parada[] {
  const offset = zona === "Zona Norte" ? 0 : zona === "Zona Sur" ? 5 : zona === "Zona Centro" ? 10 : 15;
  const tipos: Paquete["tipoPaquete"][] = ["Estándar", "Frágil", "Sobredimensionado", "Documentos"];
  const pagos: Paquete["metodoPago"][] = ["Prepagado", "Contra entrega", "Crédito"];

  return Array.from({ length: count }, (_, i) => ({
    numero: i + 1,
    paquete: {
      id: `PKG-${String(offset + i + 1).padStart(4, "0")}`,
      direccion: direccionesBogota[(offset + i) % direccionesBogota.length],
      tipoPaquete: tipos[i % tipos.length],
      peso: Math.round((Math.random() * 25 + 1) * 10) / 10,
      metodoPago: pagos[i % pagos.length],
      estado: "Pendiente" as const,
    },
    completada: false,
  }));
}

export const rutas: Ruta[] = [
  {
    id: "RUT-2024-001",
    zona: "Zona Norte",
    paquetes: 12,
    pesoActual: 340,
    pesoMax: 500,
    vehiculoTipo: "Van",
    vehiculoPlaca: "ABC-123",
    conductor: "Juan Pérez",
    estado: "Lista para Despacho",
    paradas: crearParadas("Zona Norte", 12),
  },
  {
    id: "RUT-2024-002",
    zona: "Zona Sur",
    paquetes: 8,
    pesoActual: 210,
    pesoMax: 350,
    vehiculoTipo: "NHR",
    vehiculoPlaca: "DEF-456",
    conductor: "María García",
    estado: "Lista para Despacho",
    paradas: crearParadas("Zona Sur", 8),
  },
  {
    id: "RUT-2024-003",
    zona: "Zona Centro",
    paquetes: 15,
    pesoActual: 120,
    pesoMax: 150,
    vehiculoTipo: "Moto",
    vehiculoPlaca: "GHI-789",
    conductor: "Ana Martínez",
    estado: "En Tránsito",
    paradas: crearParadas("Zona Centro", 15),
  },
  {
    id: "RUT-2024-004",
    zona: "Zona Occidente",
    paquetes: 10,
    pesoActual: 480,
    pesoMax: 800,
    vehiculoTipo: "Turbo",
    vehiculoPlaca: "JKL-012",
    conductor: "Carlos Rodríguez",
    estado: "Lista para Despacho",
    paradas: crearParadas("Zona Occidente", 10),
  },
];

export const vehiculos: Vehiculo[] = [
  { placa: "ABC-123", tipo: "Van", modelo: "Renault Kangoo 2023", capacidadPeso: 500, volumenMax: 3.5, zona: "Norte", conductor: "Juan Pérez", estado: "En Tránsito", pesoActual: 340 },
  { placa: "DEF-456", tipo: "NHR", modelo: "Chevrolet NHR 2022", capacidadPeso: 350, volumenMax: 5.0, zona: "Sur", conductor: "María García", estado: "En Tránsito", pesoActual: 210 },
  { placa: "GHI-789", tipo: "Moto", modelo: "AKT TT 150 2024", capacidadPeso: 150, volumenMax: 0.5, zona: "Centro", conductor: "Ana Martínez", estado: "En Tránsito", pesoActual: 120 },
  { placa: "JKL-012", tipo: "Turbo", modelo: "Hino Dutro 2021", capacidadPeso: 800, volumenMax: 12, zona: "Occidente", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "MNO-345", tipo: "Van", modelo: "Renault Kangoo 2022", capacidadPeso: 500, volumenMax: 3.5, zona: "Norte", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "PQR-678", tipo: "Moto", modelo: "Yamaha FZ 2024", capacidadPeso: 120, volumenMax: 0.4, zona: "Centro", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "STU-901", tipo: "NHR", modelo: "JAC X200 2023", capacidadPeso: 400, volumenMax: 6.0, zona: "Sur", conductor: "Luis Hernández", estado: "En Tránsito", pesoActual: 280 },
  { placa: "VWX-234", tipo: "Turbo", modelo: "Hino 500 2020", capacidadPeso: 1000, volumenMax: 15, zona: "Occidente", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "YZA-567", tipo: "Van", modelo: "Hafei Ruiyi 2021", capacidadPeso: 450, volumenMax: 3.0, zona: "Norte", conductor: "Sofía López", estado: "En Tránsito", pesoActual: 310 },
  { placa: "BCD-890", tipo: "Moto", modelo: "Bajaj Boxer 2024", capacidadPeso: 100, volumenMax: 0.3, zona: "Sur", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "EFG-123", tipo: "Van", modelo: "Dfsk C35 2023", capacidadPeso: 520, volumenMax: 3.8, zona: "Centro", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "HIJ-456", tipo: "NHR", modelo: "Foton Aumark 2022", capacidadPeso: 380, volumenMax: 5.5, zona: "Norte", conductor: null, estado: "Inactivo", pesoActual: 0 },
  { placa: "KLM-789", tipo: "Turbo", modelo: "Chevrolet NPR 2021", capacidadPeso: 900, volumenMax: 14, zona: "Sur", conductor: null, estado: "En Tránsito", pesoActual: 650 },
  { placa: "NOP-012", tipo: "Moto", modelo: "Honda XR 2024", capacidadPeso: 130, volumenMax: 0.45, zona: "Occidente", conductor: null, estado: "En Tránsito", pesoActual: 85 },
  { placa: "QRS-345", tipo: "Van", modelo: "Changan Star 2023", capacidadPeso: 480, volumenMax: 3.2, zona: "Centro", conductor: null, estado: "En Tránsito", pesoActual: 290 },
  { placa: "TUV-678", tipo: "NHR", modelo: "JMC Carrying 2022", capacidadPeso: 420, volumenMax: 5.8, zona: "Occidente", conductor: null, estado: "En Tránsito", pesoActual: 320 },
  { placa: "WXY-901", tipo: "Turbo", modelo: "Hino 300 2023", capacidadPeso: 850, volumenMax: 13, zona: "Norte", conductor: null, estado: "En Tránsito", pesoActual: 710 },
  { placa: "ZAB-234", tipo: "Moto", modelo: "Suzuki GN 2024", capacidadPeso: 110, volumenMax: 0.35, zona: "Sur", conductor: null, estado: "Inactivo", pesoActual: 0 },
];
