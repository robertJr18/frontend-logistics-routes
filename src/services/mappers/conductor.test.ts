import { describe, expect, it } from "vitest";
import { toConductor, toRegistrarConductorRequest } from "./conductor";
import type { ConductorResponse } from "@/types/dto/conductor";
import type { VehiculoResponse } from "@/types/dto/vehiculo";

const sampleConductor: ConductorResponse = {
  id: "c-1",
  nombre: "Carlos Mendoza",
  email: "carlos@example.com",
  modeloContrato: "POR_PARADA",
  estado: "ACTIVO",
  vehiculoAsignadoId: null,
};

const sampleVehiculo: VehiculoResponse = {
  id: "v-1",
  placa: "MNT478",
  tipo: "MOTO",
  modelo: "AKT TT 150",
  capacidadPesoKg: 50,
  volumenMaximoM3: 0.3,
  zonaOperacion: "ZNSMA",
  estado: "DISPONIBLE",
  conductorId: "c-1",
};

describe("toConductor", () => {
  it("traduce DTO a UI sin vehiculo", () => {
    expect(toConductor(sampleConductor)).toEqual({
      id: "c-1",
      nombre: "Carlos Mendoza",
      email: "carlos@example.com",
      modeloContrato: "Por parada",
      estado: "Activo",
      vehiculoAsignado: null,
    });
  });

  it("resuelve vehiculoAsignadoId al placa", () => {
    const ui = toConductor({ ...sampleConductor, vehiculoAsignadoId: "v-1" }, [sampleVehiculo]);
    expect(ui.vehiculoAsignado).toBe("MNT478");
  });

  it("EN_RUTA se mapea a Activo (limitación UI hasta PLAN-06)", () => {
    expect(toConductor({ ...sampleConductor, estado: "EN_RUTA" }).estado).toBe("Activo");
  });

  it("INACTIVO se mapea a Inactivo", () => {
    expect(toConductor({ ...sampleConductor, estado: "INACTIVO" }).estado).toBe("Inactivo");
  });

  it("vehiculoAsignado queda null si el id no se encuentra", () => {
    const ui = toConductor({ ...sampleConductor, vehiculoAsignadoId: "v-99" }, [sampleVehiculo]);
    expect(ui.vehiculoAsignado).toBeNull();
  });
});

describe("toRegistrarConductorRequest", () => {
  it("convierte form a payload con modeloContrato DTO", () => {
    expect(
      toRegistrarConductorRequest({
        nombre: "Juan Pérez",
        email: "juan@example.com",
        modeloContrato: "Recorrido completo",
      }),
    ).toEqual({
      nombre: "Juan Pérez",
      email: "juan@example.com",
      modeloContrato: "RECORRIDO_COMPLETO",
    });
  });

  it("trimea nombre y email", () => {
    const r = toRegistrarConductorRequest({
      nombre: "  Ana  ",
      email: " ana@example.com ",
      modeloContrato: "Por parada",
    });
    expect(r.nombre).toBe("Ana");
    expect(r.email).toBe("ana@example.com");
  });
});
