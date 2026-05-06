import { jwtDecode } from "jwt-decode";
import { api } from "./api";
import type { JwtClaims, LoginRequest, LoginResponse, Role } from "@/types/auth";

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>("/api/auth/login", payload, { skipAuth: true });
}

export function decodeJwt(token: string): JwtClaims {
  return jwtDecode<JwtClaims>(token);
}

export function roleFromClaims(claims: JwtClaims): Role | null {
  return parseRole(claims.rol);
}

export function parseRole(raw: string | undefined | null): Role | null {
  if (raw === "FLEET_ADMIN" || raw === "DISPATCHER" || raw === "DRIVER") return raw;
  return null;
}

export function isExpired(claims: JwtClaims): boolean {
  return Date.now() / 1000 >= claims.exp;
}
