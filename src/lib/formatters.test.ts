import { describe, expect, it } from "vitest";
import {
  formatDriverStatus,
  formatModeloContrato,
  formatRouteStatus,
  formatStopStatus,
  formatTipoVehiculo,
  formatVehicleStatus,
  modeloContratoToDto,
  tipoVehiculoToDto,
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

  it("EN_RUTA se muestra como Activo (conductor en operación)", () => {
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

  it("SIN_GESTION_CONDUCTOR y EXCLUIDA_DESPACHO se muestran como Pendiente (sin acción del conductor)", () => {
    expect(formatStopStatus("SIN_GESTION_CONDUCTOR")).toBe("Pendiente");
    expect(formatStopStatus("EXCLUIDA_DESPACHO")).toBe("Pendiente");
  });
});

describe("formatTipoVehiculo / tipoVehiculoToDto", () => {
  it("traduce DTO a UI label", () => {
    expect(formatTipoVehiculo("MOTO")).toBe("Moto");
    expect(formatTipoVehiculo("VAN")).toBe("Van");
    expect(formatTipoVehiculo("NHR")).toBe("NHR");
    expect(formatTipoVehiculo("TURBO")).toBe("Turbo");
  });

  it("UI label a DTO", () => {
    expect(tipoVehiculoToDto("Moto")).toBe("MOTO");
    expect(tipoVehiculoToDto("Van")).toBe("VAN");
    expect(tipoVehiculoToDto("NHR")).toBe("NHR");
    expect(tipoVehiculoToDto("Turbo")).toBe("TURBO");
  });

  it("formatTipoVehiculo cae a Moto en valores desconocidos", () => {
    expect(formatTipoVehiculo("BICI")).toBe("Moto");
  });
});

describe("formatModeloContrato / modeloContratoToDto", () => {
  it("DTO -> UI label", () => {
    expect(formatModeloContrato("RECORRIDO_COMPLETO")).toBe("Recorrido completo");
    expect(formatModeloContrato("POR_PARADA")).toBe("Por parada");
  });

  it("valor desconocido cae a 'Por parada'", () => {
    expect(formatModeloContrato("INVENTADO")).toBe("Por parada");
  });

  it("UI label -> DTO", () => {
    expect(modeloContratoToDto("Recorrido completo")).toBe("RECORRIDO_COMPLETO");
    expect(modeloContratoToDto("Por parada")).toBe("POR_PARADA");
  });
});
