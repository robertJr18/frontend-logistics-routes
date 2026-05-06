import { Navigate } from "react-router-dom";
import { HOME_BY_ROLE } from "@/auth/constants";
import { useAuth } from "@/auth/useAuth";

export default function PortalPage() {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  return <Navigate to={HOME_BY_ROLE[role]} replace />;
}
