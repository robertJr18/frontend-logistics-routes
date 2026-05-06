import { Navigate, Outlet } from "react-router-dom";
import { HOME_BY_ROLE } from "./constants";
import { useAuth } from "./useAuth";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  roles?: Role[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || !role) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to={HOME_BY_ROLE[role]} replace />;

  return <Outlet />;
}
