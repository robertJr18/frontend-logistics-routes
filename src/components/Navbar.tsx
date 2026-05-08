import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/auth/useAuth";

interface NavbarProps {
  title: string;
  backTo?: string;
}

export default function Navbar({ title, backTo = "/portal" }: NavbarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-[hsl(var(--surface-1))]">
      <button
        onClick={() => navigate(backTo)}
        className="text-white/60 hover:text-white transition-colors"
        aria-label="Volver"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <BrandLogo size="sm" />
      <span className="ml-auto bg-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
        {title}
      </span>
      <button
        onClick={handleLogout}
        className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
        aria-label="Cerrar sesión"
      >
        <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Salir</span>
      </button>
    </header>
  );
}
