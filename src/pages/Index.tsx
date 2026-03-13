import { useNavigate } from "react-router-dom";
import { Truck, MapPin, Settings } from "lucide-react";

const roles = [
  { title: "Despachador Logístico", description: "Gestionar rutas y confirmar despachos", icon: Truck, path: "/despachador" },
  { title: "Conductor", description: "Ver mi ruta y registrar paradas", icon: MapPin, path: "/conductor" },
  { title: "Administrador de Flota", description: "Gestionar vehículos y conductores", icon: Settings, path: "/admin" },
];

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2">
          <span className="text-white">Logistics</span>
          <span className="text-primary">Routes</span>
        </h1>
        <p className="text-subtle text-lg">Sistema de gestión de rutas</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {roles.map((role) => (
          <button key={role.path} onClick={() => navigate(role.path)} className="card-navy p-8 flex flex-col items-center text-center hover:scale-[1.02] transition-transform">
            <role.icon className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{role.title}</h2>
            <p className="text-subtle text-sm mb-6">{role.description}</p>
            <span className="btn-primary text-sm">Ingresar →</span>
          </button>
        ))}
      </div>
      <footer className="mt-16 text-subtle text-sm">© 2026 LogisticsRoutes — Santa Marta, Colombia</footer>
    </div>
  );
}
