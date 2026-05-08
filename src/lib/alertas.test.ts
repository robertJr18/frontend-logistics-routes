import { describe, expect, it } from "vitest";
import { derivarAlertas } from "./alertas";
import type { Ruta } from "@/types/domain";

const now = new Date("2026-05-08T10:00:00Z");

function makeRuta(overrides: Partial<Ruta>): Ruta {
  return {
    id: "R-001",
    zona: "Zona Norte, Santa Marta",
    ciudad: "",
    paquetes: [],
    pesoTotal: 100,
    vehiculoRequerido: "Van",
    estado: "Creada",
    fechaCreacion: "2026-05-07T08:00:00Z",
    fechaLimiteDespacho: "2026-05-09T08:00:00Z",
    paradas: [],
    ...overrides,
  };
}

describe("derivarAlertas", () => {
  it("genera alerta urgente para ruta CREADA con vencimiento < 24h", () => {
    const ruta = makeRuta({
      estado: "Creada",
      fechaLimiteDespacho: new Date(now.getTime() + 20 * 60 * 60 * 1000).toISOString(),
    });
    const alertas = derivarAlertas([ruta], now);
    expect(alertas).toHaveLength(1);
    expect(alertas[0].tipo).toBe("urgente");
    expect(alertas[0].accion).toBe("Despachar ahora");
    expect(alertas[0].rutaId).toBe("R-001");
  });

  it("no genera alerta para ruta CREADA con plazo lejano (> 24h)", () => {
    const ruta = makeRuta({
      estado: "Creada",
      fechaLimiteDespacho: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    });
    expect(derivarAlertas([ruta], now)).toHaveLength(0);
  });

  it("genera alerta urgente para ruta LISTA_PARA_DESPACHO con motivo de capacidad 90%", () => {
    const ruta = makeRuta({
      estado: "Lista para Despacho",
      motivoDespacho: "Capacidad al 90%",
    });
    const alertas = derivarAlertas([ruta], now);
    expect(alertas).toHaveLength(1);
    expect(alertas[0].tipo).toBe("urgente");
  });

  it("no genera alerta de capacidad si motivo no incluye '90'", () => {
    const ruta = makeRuta({
      estado: "Lista para Despacho",
      motivoDespacho: "Vencimiento de plazo",
    });
    expect(derivarAlertas([ruta], now)).toHaveLength(0);
  });

  it("genera alerta info por cada parada FALLIDA o NOVEDAD en ruta EN_TRANSITO", () => {
    const ruta = makeRuta({
      estado: "En Tránsito",
      paradas: [
        {
          numero: 1,
          paqueteId: "p1",
          direccion: "Dir 1",
          destinatario: "Cliente A",
          peso: 0,
          status: "Exitosa",
        },
        {
          numero: 2,
          paqueteId: "p2",
          direccion: "Dir 2",
          destinatario: "Cliente B",
          peso: 0,
          status: "Fallida",
        },
        {
          numero: 3,
          paqueteId: "p3",
          direccion: "Dir 3",
          destinatario: "Cliente C",
          peso: 0,
          status: "Novedad",
        },
      ],
    });
    const alertas = derivarAlertas([ruta], now);
    expect(alertas).toHaveLength(2);
    alertas.forEach((a) => expect(a.tipo).toBe("info"));
  });

  it("urgentes aparecen antes que info en el orden", () => {
    const urgente = makeRuta({
      id: "R-urgente",
      estado: "Creada",
      fechaLimiteDespacho: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
    });
    const info = makeRuta({
      id: "R-info",
      estado: "En Tránsito",
      paradas: [
        {
          numero: 1,
          paqueteId: "p1",
          direccion: "D",
          destinatario: "X",
          peso: 0,
          status: "Fallida",
        },
      ],
    });
    const alertas = derivarAlertas([info, urgente], now);
    expect(alertas[0].tipo).toBe("urgente");
  });
});
