export type Role = "FLEET_ADMIN" | "DISPATCHER" | "DRIVER";

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  rol: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  user: AuthUser;
}

export interface JwtClaims {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
}
