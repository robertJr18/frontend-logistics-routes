import { describe, expect, it } from "vitest";
import { isExpired, roleFromClaims } from "./auth";
import type { JwtClaims } from "@/types/auth";

const baseClaims: JwtClaims = {
  sub: "test@test.com",
  roles: [],
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
};

describe("roleFromClaims", () => {
  it("extrae rol con prefijo ROLE_", () => {
    expect(roleFromClaims({ ...baseClaims, roles: ["ROLE_DISPATCHER"] })).toBe("DISPATCHER");
    expect(roleFromClaims({ ...baseClaims, roles: ["ROLE_FLEET_ADMIN"] })).toBe("FLEET_ADMIN");
    expect(roleFromClaims({ ...baseClaims, roles: ["ROLE_DRIVER"] })).toBe("DRIVER");
  });

  it("acepta rol sin prefijo ROLE_", () => {
    expect(roleFromClaims({ ...baseClaims, roles: ["DISPATCHER"] })).toBe("DISPATCHER");
  });

  it("retorna null cuando no hay roles", () => {
    expect(roleFromClaims({ ...baseClaims, roles: [] })).toBeNull();
  });

  it("retorna null para roles desconocidos", () => {
    expect(roleFromClaims({ ...baseClaims, roles: ["ROLE_UNKNOWN"] })).toBeNull();
    expect(roleFromClaims({ ...baseClaims, roles: ["ROLE_SYSTEM"] })).toBeNull();
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
