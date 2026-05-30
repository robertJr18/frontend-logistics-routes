import { describe, expect, it } from "vitest";
import { toRutaConductor } from "./ruta-conductor";
import type { RutaConductorResponseDto } from "@/types/dto/conductor-operacion";
import type { VehiculoResponse } from "@/types/dto/vehiculo";

const paradaBase = {
  id: "par-1",
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
  fotoEvidenciaUrl: null,
  firmaReceptorUrl: null,
  nombreReceptor: "Ana García",
};

const dto: RutaConductorResponseDto = {
  id: "R-001",
  zona: "ZNSMA",
  estado: "EN_TRANSITO",
  tipoVehiculoRequerido: "VAN",
  conductorId: "c-1",
  vehiculoId: "v-1",
  fechaLimiteDespacho: "2026-05-09T08:00:00Z",
  fechaHoraInicio: "2026-05-09T06:00:00Z",
  paradas: [paradaBase],
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

describe("toRutaConductor", () => {
  it("mapea id, estado y zona correctamente", () => {
    const ruta = toRutaConductor(dto);
    expect(ruta.id).toBe("R-001");
    expect(ruta.estado).toBe("En Tránsito");
    expect(ruta.zona).toBe("Zona Norte, Santa Marta");
  });

  it("convierte tipoVehiculoRequerido a label UI", () => {
    const ruta = toRutaConductor(dto);
    expect(ruta.vehiculoRequerido).toBe("Van");
  });

  it("mapea paradas con número, dirección y status", () => {
    const ruta = toRutaConductor(dto);
    expect(ruta.paradas).toHaveLength(1);
    const p = ruta.paradas[0];
    expect(p.id).toBe("par-1");
    expect(p.numero).toBe(1);
    expect(p.direccion).toBe("Calle 10 #5-20");
    expect(p.status).toBe("Pendiente");
  });

  it("usa nombreReceptor como destinatario de la parada", () => {
    const ruta = toRutaConductor(dto);
    expect(ruta.paradas[0].destinatario).toBe("Ana García");
  });

  it("destinatario es '—' cuando nombreReceptor es null", () => {
    const ruta = toRutaConductor({
      ...dto,
      paradas: [{ ...paradaBase, nombreReceptor: null }],
    });
    expect(ruta.paradas[0].destinatario).toBe("—");
  });

  it("resuelve placa del vehículo y pesoTotal desde la lista", () => {
    const ruta = toRutaConductor(dto, [vehiculo]);
    expect(ruta.vehiculoAsignado).toBe("MNT478");
    expect(ruta.pesoTotal).toBe(300);
  });

  it("vehiculoAsignado es undefined y pesoTotal es 0 sin lista de vehículos", () => {
    const ruta = toRutaConductor(dto);
    expect(ruta.vehiculoAsignado).toBeUndefined();
    expect(ruta.pesoTotal).toBe(0);
  });

  it("mapea parada EXITOSA a status Exitosa", () => {
    const ruta = toRutaConductor({
      ...dto,
      paradas: [{ ...paradaBase, estado: "EXITOSA" as const }],
    });
    expect(ruta.paradas[0].status).toBe("Exitosa");
  });

  it("mapea parada FALLIDA con motivoNovedad a motivoFallo", () => {
    const ruta = toRutaConductor({
      ...dto,
      paradas: [{ ...paradaBase, estado: "FALLIDA" as const, motivoNovedad: "CLIENTE_AUSENTE" }],
    });
    expect(ruta.paradas[0].status).toBe("Fallida");
    expect(ruta.paradas[0].motivoFallo).toBe("CLIENTE_AUSENTE");
  });

  it("crea paquetes desde las paradas con id y direccion", () => {
    const ruta = toRutaConductor(dto);
    expect(ruta.paquetes).toHaveLength(1);
    expect(ruta.paquetes[0].id).toBe("pkg-1");
    expect(ruta.paquetes[0].direccion).toBe("Calle 10 #5-20");
  });

  it("zona desconocida cae al raw string en paradas y paquetes", () => {
    const ruta = toRutaConductor({ ...dto, zona: "XXXXX" });
    expect(ruta.zona).toBe("XXXXX");
    expect(ruta.paquetes[0].zona).toBe("XXXXX");
  });

  it("usa índice + 1 como número cuando orden es 0", () => {
    const ruta = toRutaConductor({
      ...dto,
      paradas: [{ ...paradaBase, orden: 0 }],
    });
    expect(ruta.paradas[0].numero).toBe(1);
  });
});
