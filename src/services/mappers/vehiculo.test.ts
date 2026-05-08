import { describe, expect, it } from "vitest";
import { toActualizarVehiculoRequest, toVehiculo, toVehiculoRequest } from "./vehiculo";
import type { VehiculoResponse } from "@/types/dto/vehiculo";
import type { ConductorResponse } from "@/types/dto/conductor";

const sampleDto: VehiculoResponse = {
  id: "v-1",
  placa: "MNT478",
  tipo: "MOTO",
  modelo: "AKT TT 150",
  capacidadPesoKg: 50,
  volumenMaximoM3: 0.3,
  zonaOperacion: "ZNSMA",
  estado: "DISPONIBLE",
  conductorId: null,
};

const conductor: ConductorResponse = {
  id: "c-1",
  nombre: "Carlos Mendoza",
  email: "carlos@example.com",
  modeloContrato: "POR_PARADA",
  estado: "ACTIVO",
  vehiculoAsignadoId: "v-1",
};

describe("toVehiculo", () => {
  it("traduce DTO a UI con zona expandida y sin conductor", () => {
    const ui = toVehiculo(sampleDto);
    expect(ui).toEqual({
      id: "v-1",
      placa: "MNT478",
      tipo: "Moto",
      modelo: "AKT TT 150",
      capacidadPeso: 50,
      volumenMax: 0.3,
      zona: "Zona Norte, Santa Marta",
      estado: "Disponible",
      conductorAsignado: null,
    });
  });

  it("resuelve conductorId al nombre cuando se pasa la lista", () => {
    const ui = toVehiculo(
      { ...sampleDto, conductorId: "c-1" },
      [conductor],
    );
    expect(ui.conductorAsignado).toBe("Carlos Mendoza");
  });

  it("conductorAsignado queda null si el id no se encuentra en la lista", () => {
    const ui = toVehiculo({ ...sampleDto, conductorId: "c-99" }, [conductor]);
    expect(ui.conductorAsignado).toBeNull();
  });

  it("zona desconocida cae al raw geohash", () => {
    const ui = toVehiculo({ ...sampleDto, zonaOperacion: "XXXXX" });
    expect(ui.zona).toBe("XXXXX");
  });
});

describe("toVehiculoRequest / toActualizarVehiculoRequest", () => {
  it("convierte form a payload con tipo y geohash", () => {
    const req = toVehiculoRequest({
      placa: "MNT478",
      tipo: "Moto",
      modelo: "AKT TT 150",
      capacidad: 50,
      volumen: 0.3,
      zonaLabel: "Zona Norte, Santa Marta",
    });
    expect(req).toEqual({
      placa: "MNT478",
      tipo: "MOTO",
      modelo: "AKT TT 150",
      capacidadPesoKg: 50,
      volumenMaximoM3: 0.3,
      zonaOperacion: "ZNSMA",
    });
  });

  it("toActualizarVehiculoRequest omite placa", () => {
    const req = toActualizarVehiculoRequest({
      placa: "MNT478",
      tipo: "Van",
      modelo: "Chevrolet N300",
      capacidad: 300,
      volumen: 4.2,
      zonaLabel: "Zona El Prado, Barranquilla",
    });
    expect(req).not.toHaveProperty("placa");
    expect(req).toEqual({
      tipo: "VAN",
      modelo: "Chevrolet N300",
      capacidadPesoKg: 300,
      volumenMaximoM3: 4.2,
      zonaOperacion: "ZPBQA",
    });
  });

  it("lanza si la zona no existe en la tabla", () => {
    expect(() =>
      toVehiculoRequest({
        placa: "MNT478",
        tipo: "Moto",
        modelo: "X",
        capacidad: 50,
        volumen: 0.3,
        zonaLabel: "Zona Inventada",
      }),
    ).toThrow();
  });
});
