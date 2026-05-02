import { useNavigate } from "react-router-dom";
import { Truck, MapPin, Settings, ArrowRight, LogOut } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const roles = [
  {
    title: "Despachador Logístico",
    description: "Gestiona rutas, asigna conductores y confirma despachos en tiempo real.",
    icon: Truck,
    path: "/despachador",
    accent: "from-primary/20 to-primary/5",
  },
  {
    title: "Conductor",
    description: "Visualiza tu ruta del día, registra paradas y reporta novedades.",
    icon: MapPin,
    path: "/conductor",
    accent: "from-[hsl(var(--success))]/20 to-[hsl(var(--success))]/5",
  },
  {
    title: "Administrador de Flota",
    description: "Administra vehículos, conductores y supervisa la operación general.",
    icon: Settings,
    path: "/admin",
    accent: "from-[hsl(var(--primary-glow))]/20 to-[hsl(var(--primary-glow))]/5",
  },
];

export default function Portal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo size="sm" />
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-subtle hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-2xl mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Bienvenido
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Selecciona tu panel de trabajo</h1>
          <p className="text-subtle text-lg">Cada rol tiene una interfaz diseñada para su flujo operativo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {roles.map((role) => (
            <button
              key={role.path}
              onClick={() => navigate(role.path)}
              className="card-navy p-8 text-left hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br ${role.accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-6 group-hover:bg-primary/25 transition-colors">
                  <role.icon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">{role.title}</h2>
                <p className="text-subtle text-sm leading-relaxed mb-8">{role.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Ingresar <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-soft">
        © 2026 LogisticsRoutes — Santa Marta, Colombia
      </footer>
    </div>
  );
}
