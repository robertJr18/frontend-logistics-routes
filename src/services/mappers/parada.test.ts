import { describe, expect, it } from "vitest";
import { toParada } from "./parada";
import type { ParadaResponse } from "@/types/dto/parada";

const base: ParadaResponse = {
  id: "par-1",
  rutaId: "r-1",
  paqueteId: "pkg-1",
  orden: 2,
  direccion: "Calle 10 #5-20",
  latitud: 11.24,
  longitud: -74.2,
  tipoMercancia: "ESTANDAR",
  metodoPago: "PREPAGO",
  fechaLimiteEntrega: "2026-05-10",
  estado: "PENDIENTE",
  motivoNovedad: null,
  fechaHoraGestion: null,
  firmaReceptorUrl: null,
  fotoEvidenciaUrl: null,
  nombreReceptor: "Juan Pérez",
  origen: "SISTEMA",
};

describe("toParada", () => {
  it("usa dto.orden como numero de parada", () => {
    const p = toParada(base, 0);
    expect(p.numero).toBe(2);
  });

  it("usa el índice + 1 cuando orden es 0", () => {
    const p = toParada({ ...base, orden: 0 }, 4);
    expect(p.numero).toBe(5);
  });

  it("mapea nombreReceptor a destinatario", () => {
    const p = toParada(base, 0);
    expect(p.destinatario).toBe("Juan Pérez");
  });

  it("destinatario es '—' cuando nombreReceptor es null", () => {
    const p = toParada({ ...base, nombreReceptor: null }, 0);
    expect(p.destinatario).toBe("—");
  });

  it("mapea estado PENDIENTE a 'Pendiente'", () => {
    const p = toParada(base, 0);
    expect(p.status).toBe("Pendiente");
  });

  it("mapea estado EXITOSA a 'Exitosa'", () => {
    const p = toParada({ ...base, estado: "EXITOSA" }, 0);
    expect(p.status).toBe("Exitosa");
  });

  it("mapea motivoNovedad a motivoFallo", () => {
    const p = toParada({ ...base, motivoNovedad: "CLIENTE_AUSENTE" }, 0);
    expect(p.motivoFallo).toBe("CLIENTE_AUSENTE");
  });
});
