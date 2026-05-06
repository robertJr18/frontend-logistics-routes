import { describe, expect, it } from "vitest";
import { isExpired, parseRole, roleFromClaims } from "./auth";
import type { JwtClaims } from "@/types/auth";

const baseClaims: JwtClaims = {
  sub: "test@test.com",
  rol: "DISPATCHER",
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
};

describe("roleFromClaims", () => {
  it("extrae el rol del claim singular 'rol'", () => {
    expect(roleFromClaims({ ...baseClaims, rol: "DISPATCHER" })).toBe("DISPATCHER");
    expect(roleFromClaims({ ...baseClaims, rol: "FLEET_ADMIN" })).toBe("FLEET_ADMIN");
    expect(roleFromClaims({ ...baseClaims, rol: "DRIVER" })).toBe("DRIVER");
  });

  it("retorna null para roles desconocidos", () => {
    expect(roleFromClaims({ ...baseClaims, rol: "" })).toBeNull();
    expect(roleFromClaims({ ...baseClaims, rol: "UNKNOWN" })).toBeNull();
    expect(roleFromClaims({ ...baseClaims, rol: "SYSTEM" })).toBeNull();
  });
});

describe("parseRole", () => {
  it("acepta los 3 roles UI", () => {
    expect(parseRole("FLEET_ADMIN")).toBe("FLEET_ADMIN");
    expect(parseRole("DISPATCHER")).toBe("DISPATCHER");
    expect(parseRole("DRIVER")).toBe("DRIVER");
  });

  it("rechaza valores fuera de la lista", () => {
    expect(parseRole(undefined)).toBeNull();
    expect(parseRole(null)).toBeNull();
    expect(parseRole("ROLE_DISPATCHER")).toBeNull();
    expect(parseRole("admin")).toBeNull();
  });
});

describe("isExpired", () => {
  it("retorna true cuando exp está en el pasado", () => {
    const past = Math.floor(Date.now() / 1000) - 100;
    expect(isExpired({ ...baseClaims, exp: past })).toBe(true);
  });

  it("retorna false cuando exp está en el futuro", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isExpired({ ...baseClaims, exp: future })).toBe(false);
  });
});
