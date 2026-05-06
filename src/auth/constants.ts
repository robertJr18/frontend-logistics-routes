import type { Role } from "@/types/auth";

export const HOME_BY_ROLE: Record<Role, string> = {
  FLEET_ADMIN: "/admin",
  DISPATCHER: "/despachador",
  DRIVER: "/conductor",
};
