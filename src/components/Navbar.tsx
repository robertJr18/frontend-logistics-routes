import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import StatusBadge, { type BadgeVariant } from "./StatusBadge";

interface NavbarProps {
  roleName: string;
  badgeVariant?: BadgeVariant;
}

export default function Navbar({ roleName, badgeVariant = "info" }: NavbarProps) {
  const navigate = useNavigate();
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1 hover:bg-muted rounded transition-colors">
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <span className="text-sm font-bold tracking-tight text-foreground">
          Sistema de Gestión Logística
        </span>
      </div>
      <StatusBadge variant={badgeVariant}>{roleName}</StatusBadge>
    </header>
  );
}
