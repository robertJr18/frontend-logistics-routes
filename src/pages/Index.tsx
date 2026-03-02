import { Package, Truck, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    icon: Package,
    emoji: "📦",
    title: "Despachador Logístico",
    description: "Gestión de rutas, despacho y seguimiento de paquetes",
    path: "/despachador",
  },
  {
    icon: Truck,
    emoji: "🚛",
    title: "Conductor",
    description: "Gestión de paradas, entregas y novedades en ruta",
    path: "/conductor",
  },
  {
    icon: Settings,
    emoji: "⚙️",
    title: "Administrador de Flota",
    description: "Control de vehículos, conductores y disponibilidad",
    path: "/admin",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Logistics<span className="text-primary">Routes</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Sistema de gestión de rutas de última milla
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map((role) => (
          <button
            key={role.path}
            onClick={() => navigate(role.path)}
            className="group bg-card border border-border rounded-lg p-8 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="text-4xl mb-4">{role.emoji}</div>
            <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {role.title}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{role.description}</p>
            <span className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md transition-transform group-hover:scale-105">
              Ingresar →
            </span>
          </button>
        ))}
      </div>

      <p className="mt-12 text-muted-foreground text-xs">
        © 2024 LogisticsRoutes — Bogotá, Colombia
      </p>
    </div>
  );
};

export default Index;
