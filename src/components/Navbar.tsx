import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface NavbarProps {
  roleName: string;
  badgeVariant?: string;
}

export default function Navbar({ roleName }: NavbarProps) {
  const navigate = useNavigate();
  return (
    <header className="h-12 border-b-2 border-foreground flex items-center justify-between px-6 bg-card">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1 hover:bg-muted">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold tracking-tight uppercase">
          Sistema Logístico
        </span>
      </div>
      <span className="text-xs font-bold border-2 border-foreground px-2 py-0.5 uppercase tracking-wide">
        {roleName}
      </span>
    </header>
  );
}
