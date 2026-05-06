export type Role = "FLEET_ADMIN" | "DISPATCHER" | "DRIVER";

export interface AuthUser {
  email: string;
  rol: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  rol: string;
  expiracion: string;
}

export interface JwtClaims {
  sub: string;
  rol: string;
  exp: number;
  iat: number;
}
