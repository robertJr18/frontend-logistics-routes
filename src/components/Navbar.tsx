import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  title: string;
  backTo?: string;
}

export default function Navbar({ title, backTo = "/" }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
      <button onClick={() => navigate(backTo)} className="text-white/60 hover:text-white">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button onClick={() => navigate("/")} className="text-white/60 hover:text-white">
        <Home className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-white">Logistics</span>
        <span className="text-xl font-bold text-primary">Routes</span>
      </div>
      <span className="ml-auto bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
        {title}
      </span>
    </header>
  );
}
