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
      <div className="mb-10 text-center">
        <p className="text-xs text-muted-foreground mb-2 tracking-widest uppercase">— Prototipo Lo-Fi —</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          Sistema de Gestión Logística
        </h1>
        <p className="text-muted-foreground text-sm">Módulo 2 — Planificación de Rutas y Gestión de Flota</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        {roles.map((role) => (
          <button
            key={role.path}
            onClick={() => navigate(role.path)}
            className="group bg-card border-2 border-foreground p-6 text-left hover:bg-muted focus:outline-none"
          >
            <div className="h-10 w-10 border-2 border-foreground flex items-center justify-center mb-3">
              <role.icon className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold mb-1 uppercase tracking-wide">
              {role.title}
            </h2>
            <p className="text-muted-foreground text-xs mb-4">{role.description}</p>
            <span className="inline-flex items-center px-3 py-1.5 border-2 border-foreground text-xs font-bold uppercase tracking-wide">
              Ingresar →
            </span>
          </button>
        ))}
      </div>

      <p className="mt-10 text-muted-foreground text-xs">
        © 2026 Sistema de Gestión Logística — Santa Marta, Colombia
      </p>
    </div>
  );
}
