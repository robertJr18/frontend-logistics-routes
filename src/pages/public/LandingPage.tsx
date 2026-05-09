import { useNavigate } from "react-router-dom";
import { ArrowRight, Route, Truck, MapPin, BarChart3, ShieldCheck, Clock } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import heroImg from "@/assets/hero-logistics.jpg";

const features = [
  {
    icon: Route,
    title: "Planificación de rutas",
    desc: "Crear, asignar y despachar rutas por zona y capacidad de vehículo.",
  },
  {
    icon: Truck,
    title: "Gestión de flota",
    desc: "Control de vehículos, capacidades y conductores asignados.",
  },
  {
    icon: MapPin,
    title: "Seguimiento en terreno",
    desc: "Registro de paradas, novedades y entregas durante la operación.",
  },
  {
    icon: BarChart3,
    title: "Cierre de ruta",
    desc: "Resumen de entregas exitosas, fallidas y novedades por turno.",
  },
  {
    icon: ShieldCheck,
    title: "Roles operativos",
    desc: "Accesos diferenciados para Despachador, Conductor y Admin de Flota.",
  },
  {
    icon: Clock,
    title: "Operación continua",
    desc: "Pensado para la dinámica diaria del equipo de última milla.",
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <BrandLogo size="sm" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-subtle">
            <a href="#features" className="hover:text-white transition-colors">
              Características
            </a>
            <a href="#acceso" className="hover:text-white transition-colors">
              Acceso
            </a>
          </nav>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary text-sm flex items-center gap-2"
          >
            Iniciar sesión <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-16 min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Operación logística de última milla"
            className="w-full h-full object-cover opacity-40"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center w-full">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Plataforma interna de logística
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] mb-6">
            Gestión de <span className="gradient-primary-text">rutas y flota</span> para tu
            operación.
          </h1>
          <p className="text-lg text-subtle mb-8 max-w-2xl mx-auto leading-relaxed">
            LogisticsRoutes centraliza el despacho, la asignación de conductores y el seguimiento de
            entregas para el equipo operativo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="btn-primary flex items-center gap-2"
            >
              Iniciar sesión <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Características
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
              Lo que aborda la plataforma
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-navy p-7 hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-subtle text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESS */}
      <section id="acceso" className="py-24 px-6">
        <div className="max-w-3xl mx-auto card-elevated p-12 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Acceso al sistema</h2>
            <p className="text-subtle text-base mb-8 max-w-xl mx-auto">
              Ingresa con las credenciales que te fueron entregadas. Si necesitas acceso, contacta a
              tu supervisor.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn-primary inline-flex items-center gap-2"
            >
              Iniciar sesión <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <p className="text-sm text-subtle">© 2026 LogisticsRoutes — Santa Marta, Colombia</p>
        </div>
      </footer>
    </div>
  );
}
