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
  { id: "C001", nombre: "Carlos Iguarán", cedula: "1.082.456.789", telefono: "311-234-5678", disponible: false },
  { id: "C002", nombre: "Yesid Pertuz", cedula: "85.987.654", telefono: "300-876-5432", disponible: false },
  { id: "C003", nombre: "Leidy Orozco", cedula: "36.123.456", telefono: "315-111-2233", disponible: true },
  { id: "C004", nombre: "Andrés Daza", cedula: "1.084.876.543", telefono: "320-444-5566", disponible: false },
  { id: "C005", nombre: "Paola Rincón", cedula: "36.654.321", telefono: "312-777-8899", disponible: true },
  { id: "C006", nombre: "Jorge Pedraza", cedula: "85.321.654", telefono: "318-222-3344", disponible: true },
];

const direccionesSantaMarta = [
  "Cra. 5 #22-40, Centro Histórico, Santa Marta",
  "Calle 10 #3-15, Barrio Pescaito, Santa Marta",
  "Av. del Río #29-18, El Prado, Santa Marta",
  "Cra. 1 #7-60, Rodadero, Santa Marta",
  "Calle 22 #19-35, Barrio Bavaria, Santa Marta",
  "Av. Libertador #44-12, Mamatoco, Santa Marta",
  "Cra. 8 #15-27, Barrio Bastidas, Santa Marta",
  "Calle 30 #2-55, Bello Horizonte, Santa Marta",
  "Cra. 3 #18-10, Barrio Boston, Santa Marta",
  "Calle 14 #5-32, Barrio Obrero, Santa Marta",
  "Av. del Ferrocarril #12-45, Gaira, Santa Marta",
  "Cra. 19 #30-20, Timayui, Santa Marta",
  "Calle 36 #8-15, María Eugenia, Santa Marta",
  "Av. del Río #52-30, Pando, Santa Marta",
  "Cra. 12 #25-18, Las Américas, Santa Marta",
  "Calle 29 #4-60, Santafé, Santa Marta",
  "Cra. 15 #33-42, Chimila, Santa Marta",
  "Calle 20 #10-55, Simón Bolívar, Santa Marta",
  "Av. Libertador #60-22, Los Fundadores, Santa Marta",
  "Cra. 6 #16-38, Pozos Colorados, Santa Marta",
];

function crearParadas(zona: string, count: number): Parada[] {
  const offset = zona === "Zona Centro" ? 0 : zona === "Zona Sur" ? 5 : zona === "Zona Norte" ? 10 : 15;
  const tipos: Paquete["tipoPaquete"][] = ["Estándar", "Frágil", "Sobredimensionado", "Documentos"];
  const pagos: Paquete["metodoPago"][] = ["Prepagado", "Contra entrega", "Crédito"];

  return Array.from({ length: count }, (_, i) => ({
    numero: i + 1,
    paquete: {
      id: `PKG-${String(offset + i + 1).padStart(4, "0")}`,
      direccion: direccionesSantaMarta[(offset + i) % direccionesSantaMarta.length],
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
    id: "RUT-2026-001",
    zona: "Zona Centro",
    paquetes: 12,
    pesoActual: 340,
    pesoMax: 500,
    vehiculoTipo: "Van",
    vehiculoPlaca: "OYP-421",
    conductor: "Carlos Iguarán",
    estado: "Lista para Despacho",
    paradas: crearParadas("Zona Centro", 12),
  },
  {
    id: "RUT-2026-002",
    zona: "Zona Sur",
    paquetes: 8,
    pesoActual: 210,
    pesoMax: 350,
    vehiculoTipo: "NHR",
    vehiculoPlaca: "VCF-112",
    conductor: "Yesid Pertuz",
    estado: "Lista para Despacho",
    paradas: crearParadas("Zona Sur", 8),
  },
  {
    id: "RUT-2026-003",
    zona: "Zona Norte",
    paquetes: 15,
    pesoActual: 120,
    pesoMax: 150,
    vehiculoTipo: "Moto",
    vehiculoPlaca: "SMB-43C",
    conductor: "Andrés Daza",
    estado: "En Tránsito",
    paradas: crearParadas("Zona Norte", 15),
  },
  {
    id: "RUT-2026-004",
    zona: "Zona Este",
    paquetes: 10,
    pesoActual: 480,
    pesoMax: 800,
    vehiculoTipo: "Turbo",
    vehiculoPlaca: "TBK-893",
    conductor: "Leidy Orozco",
    estado: "Lista para Despacho",
    paradas: crearParadas("Zona Este", 10),
  },
];

export const vehiculos: Vehiculo[] = [
  { placa: "OYP-421", tipo: "Van", modelo: "Renault Kangoo 2023", capacidadPeso: 500, volumenMax: 3.5, zona: "Centro", conductor: "Carlos Iguarán", estado: "En Tránsito", pesoActual: 340 },
  { placa: "VCF-112", tipo: "NHR", modelo: "Chevrolet NHR 2022", capacidadPeso: 350, volumenMax: 5.0, zona: "Sur", conductor: "Yesid Pertuz", estado: "En Tránsito", pesoActual: 210 },
  { placa: "SMB-43C", tipo: "Moto", modelo: "AKT TT 150 2024", capacidadPeso: 150, volumenMax: 0.5, zona: "Norte", conductor: "Andrés Daza", estado: "En Tránsito", pesoActual: 120 },
  { placa: "TBK-893", tipo: "Turbo", modelo: "Hino Dutro 2021", capacidadPeso: 800, volumenMax: 12, zona: "Este", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "RFT-21A", tipo: "Moto", modelo: "Yamaha FZ 2024", capacidadPeso: 120, volumenMax: 0.4, zona: "Centro", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "MSD-745", tipo: "NHR", modelo: "JAC X200 2023", capacidadPeso: 400, volumenMax: 6.0, zona: "Sur", conductor: "Jorge Pedraza", estado: "En Tránsito", pesoActual: 280 },
  { placa: "KLT-562", tipo: "Van", modelo: "Hafei Ruiyi 2021", capacidadPeso: 450, volumenMax: 3.0, zona: "Norte", conductor: "Paola Rincón", estado: "En Tránsito", pesoActual: 310 },
  { placa: "BNQ-734", tipo: "Moto", modelo: "Bajaj Boxer 2024", capacidadPeso: 100, volumenMax: 0.3, zona: "Sur", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "FHR-291", tipo: "Van", modelo: "Dfsk C35 2023", capacidadPeso: 520, volumenMax: 3.8, zona: "Centro", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "JPS-845", tipo: "NHR", modelo: "Foton Aumark 2022", capacidadPeso: 380, volumenMax: 5.5, zona: "Norte", conductor: null, estado: "Inactivo", pesoActual: 0 },
  { placa: "WCM-103", tipo: "Turbo", modelo: "Chevrolet NPR 2021", capacidadPeso: 900, volumenMax: 14, zona: "Sur", conductor: null, estado: "En Tránsito", pesoActual: 650 },
  { placa: "DKR-476", tipo: "Moto", modelo: "Honda XR 2024", capacidadPeso: 130, volumenMax: 0.45, zona: "Este", conductor: null, estado: "En Tránsito", pesoActual: 85 },
  { placa: "GNS-618", tipo: "Van", modelo: "Changan Star 2023", capacidadPeso: 480, volumenMax: 3.2, zona: "Centro", conductor: null, estado: "En Tránsito", pesoActual: 290 },
  { placa: "LPV-952", tipo: "NHR", modelo: "JMC Carrying 2022", capacidadPeso: 420, volumenMax: 5.8, zona: "Este", conductor: null, estado: "En Tránsito", pesoActual: 320 },
  { placa: "HQT-387", tipo: "Turbo", modelo: "Hino 300 2023", capacidadPeso: 850, volumenMax: 13, zona: "Norte", conductor: null, estado: "En Tránsito", pesoActual: 710 },
  { placa: "CPB-214", tipo: "Moto", modelo: "Suzuki GN 2024", capacidadPeso: 110, volumenMax: 0.35, zona: "Sur", conductor: null, estado: "Inactivo", pesoActual: 0 },
  { placa: "NRF-539", tipo: "Van", modelo: "Renault Kangoo 2022", capacidadPeso: 500, volumenMax: 3.5, zona: "Norte", conductor: null, estado: "Disponible", pesoActual: 0 },
  { placa: "TMK-761", tipo: "Turbo", modelo: "Hino 500 2020", capacidadPeso: 1000, volumenMax: 15, zona: "Este", conductor: null, estado: "Disponible", pesoActual: 0 },
];
