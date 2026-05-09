import { describe, expect, it } from "vitest";
import { toRuta } from "./ruta";
import type { RutaResponse } from "@/types/dto/ruta";
import type { ConductorResponse } from "@/types/dto/conductor";
import type { VehiculoResponse } from "@/types/dto/vehiculo";

const parada = {
  id: "par-1",
  rutaId: "r-1",
  paqueteId: "pkg-1",
  orden: 1,
  direccion: "Calle 10 #5-20",
  latitud: 11.24,
  longitud: -74.2,
  tipoMercancia: "ESTANDAR" as const,
  metodoPago: "PREPAGO" as const,
  fechaLimiteEntrega: "2026-05-10",
  estado: "PENDIENTE" as const,
  motivoNovedad: null,
  fechaHoraGestion: null,
  firmaReceptorUrl: null,
  fotoEvidenciaUrl: null,
  nombreReceptor: "Ana García",
  origen: "SISTEMA" as const,
};

const baseDto: RutaResponse = {
  id: "R-001",
  zona: "ZNSMA",
  estado: "CREADA",
  pesoAcumuladoKg: 120.5,
  tipoVehiculoRequerido: "VAN",
  vehiculoId: null,
  conductorId: null,
  fechaCreacionRuta: "2026-05-07T08:00:00Z",
  fechaLimiteDespacho: "2026-05-09T08:00:00Z",
  fechaHoraInicio: null,
  fechaHoraCierre: null,
  tipoCierre: null,
  motivoDespacho: null,
  paradas: [parada],
};

const vehiculo: VehiculoResponse = {
  id: "v-1",
  placa: "MNT478",
  tipo: "VAN",
  modelo: "Chevrolet N300",
  capacidadPesoKg: 300,
  volumenMaximoM3: 4.2,
  zonaOperacion: "ZNSMA",
  estado: "EN_TRANSITO",
  conductorId: "c-1",
};

const conductor: ConductorResponse = {
  id: "c-1",
  nombre: "Carlos Mendoza",
  email: "carlos@example.com",
  modeloContrato: "POR_PARADA",
  estado: "EN_RUTA",
  vehiculoAsignadoId: "v-1",
};

describe("toRuta", () => {
  it("mapea campos básicos correctamente", () => {
    const ruta = toRuta(baseDto);
    expect(ruta.id).toBe("R-001");
    expect(ruta.pesoTotal).toBe(120.5);
    expect(ruta.estado).toBe("Creada");
    expect(ruta.vehiculoRequerido).toBe("Van");
    expect(ruta.fechaLimiteDespacho).toBe("2026-05-09T08:00:00Z");
  });

  it("convierte zona geohash a label", () => {
    const ruta = toRuta(baseDto);
    expect(ruta.zona).toBe("Zona Norte, Santa Marta");
  });

  it("zona desconocida cae al raw string", () => {
    const ruta = toRuta({ ...baseDto, zona: "XXXXX" });
    expect(ruta.zona).toBe("XXXXX");
  });

  it("crea paquetes desde paradas", () => {
    const ruta = toRuta(baseDto);
    expect(ruta.paquetes).toHaveLength(1);
    expect(ruta.paquetes[0].id).toBe("pkg-1");
    expect(ruta.paquetes[0].direccion).toBe("Calle 10 #5-20");
  });

  it("resuelve placa del vehiculo desde la lista", () => {
    const ruta = toRuta({ ...baseDto, vehiculoId: "v-1" }, [vehiculo]);
    expect(ruta.vehiculoAsignado).toBe("MNT478");
  });

  it("vehiculoAsignado es undefined si vehiculoId es null", () => {
    const ruta = toRuta(baseDto);
    expect(ruta.vehiculoAsignado).toBeUndefined();
  });

  it("resuelve nombre del conductor desde la lista", () => {
    const ruta = toRuta({ ...baseDto, conductorId: "c-1" }, [vehiculo], [conductor]);
    expect(ruta.conductorAsignado).toBe("Carlos Mendoza");
  });

  it("motivoDespacho undefined cuando el DTO trae null", () => {
    const ruta = toRuta(baseDto);
    expect(ruta.motivoDespacho).toBeUndefined();
  });

  it("fechaCierre se popula desde fechaHoraCierre del DTO", () => {
    const ruta = toRuta({ ...baseDto, fechaHoraCierre: "2026-05-10T14:30:00Z" });
    expect(ruta.fechaCierre).toBe("2026-05-10T14:30:00Z");
  });

  it("fechaCierre es undefined cuando fechaHoraCierre es null", () => {
    const ruta = toRuta(baseDto);
    expect(ruta.fechaCierre).toBeUndefined();
  });

  it("calcula resumen contando estados de paradas", () => {
    const paradas = [
      { ...parada, paqueteId: "p1", estado: "EXITOSA" as const },
      { ...parada, paqueteId: "p2", estado: "EXITOSA" as const },
      { ...parada, paqueteId: "p3", estado: "FALLIDA" as const },
      { ...parada, paqueteId: "p4", estado: "NOVEDAD" as const },
      { ...parada, paqueteId: "p5", estado: "SIN_GESTION_CONDUCTOR" as const },
      { ...parada, paqueteId: "p6", estado: "PENDIENTE" as const },
    ];
    const ruta = toRuta({ ...baseDto, paradas });
    expect(ruta.resumen).toEqual({
      exitosas: 2,
      fallidas: 1,
      novedades: 1,
      sinGestion: 1,
      total: 6,
    });
  });

  it("resumen total es 0 cuando no hay paradas", () => {
    const ruta = toRuta({ ...baseDto, paradas: [] });
    expect(ruta.resumen).toEqual({
      exitosas: 0,
      fallidas: 0,
      novedades: 0,
      sinGestion: 0,
      total: 0,
    });
  });
});
