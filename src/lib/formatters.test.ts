import { describe, expect, it } from "vitest";
import {
  formatDriverStatus,
  formatRouteStatus,
  formatStopStatus,
  formatVehicleStatus,
} from "./formatters";

describe("formatRouteStatus", () => {
  it("mapea enums conocidos a labels UI", () => {
    expect(formatRouteStatus("CREADA")).toBe("Creada");
    expect(formatRouteStatus("LISTA_PARA_DESPACHO")).toBe("Lista para Despacho");
    expect(formatRouteStatus("EN_TRANSITO")).toBe("En Tránsito");
    expect(formatRouteStatus("CERRADA_AUTOMATICA")).toBe("Cerrada Automática");
    expect(formatRouteStatus("CERRADA_FORZADA")).toBe("Cerrada Forzada");
  });

  it("devuelve fallback Creada para enums desconocidos", () => {
    expect(formatRouteStatus("INVENTADO")).toBe("Creada");
  });
});

describe("formatVehicleStatus", () => {
  it("mapea enums conocidos", () => {
    expect(formatVehicleStatus("DISPONIBLE")).toBe("Disponible");
    expect(formatVehicleStatus("EN_TRANSITO")).toBe("En Tránsito");
    expect(formatVehicleStatus("INACTIVO")).toBe("Inactivo");
  });

  it("fallback a Inactivo para desconocidos", () => {
    expect(formatVehicleStatus("X")).toBe("Inactivo");
  });
});

describe("formatDriverStatus", () => {
  it("mapea ACTIVO e INACTIVO", () => {
    expect(formatDriverStatus("ACTIVO")).toBe("Activo");
    expect(formatDriverStatus("INACTIVO")).toBe("Inactivo");
  });

  it("EN_RUTA se muestra como Activo (operacional) hasta unificación PLAN-06", () => {
    expect(formatDriverStatus("EN_RUTA")).toBe("Activo");
  });
});

describe("formatStopStatus", () => {
  it("mapea estados básicos", () => {
    expect(formatStopStatus("PENDIENTE")).toBe("Pendiente");
    expect(formatStopStatus("EXITOSA")).toBe("Exitosa");
    expect(formatStopStatus("FALLIDA")).toBe("Fallida");
    expect(formatStopStatus("NOVEDAD")).toBe("Novedad");
  });

  it("SIN_GESTION_CONDUCTOR y EXCLUIDA_DESPACHO se muestran como Pendiente (UI no los distingue hasta PLAN-06)", () => {
    expect(formatStopStatus("SIN_GESTION_CONDUCTOR")).toBe("Pendiente");
    expect(formatStopStatus("EXCLUIDA_DESPACHO")).toBe("Pendiente");
  });
});
