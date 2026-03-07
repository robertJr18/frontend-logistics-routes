import { Truck, MapPin, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const roles = [
  {
    icon: Truck,
    title: "Despachador Logístico",
    description: "Gestionar rutas y confirmar despachos",
    path: "/despachador",
  },
  {
    icon: MapPin,
    title: "Conductor",
    description: "Ver mi ruta y registrar paradas",
    path: "/conductor",
  },
  {
    icon: Settings,
    title: "Administrador de Flota",
    description: "Gestionar vehículos y conductores",
    path: "/admin",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
          Sistema de Gestión Logística
        </h1>
        <p className="text-muted-foreground text-sm">Módulo 2 — Planificación de Rutas y Gestión de Flota</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map((role) => (
          <button
            key={role.path}
            onClick={() => navigate(role.path)}
            className="group bg-card border border-border rounded-lg p-8 text-left transition-all hover:border-primary/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <role.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {role.title}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">{role.description}</p>
            <span className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg transition-transform group-hover:scale-105">
              Ingresar →
            </span>
          </button>
        ))}
      </div>

      <p className="mt-12 text-muted-foreground text-xs">
        © 2026 Sistema de Gestión Logística — Santa Marta, Colombia
      </p>
    </div>
  );
}
