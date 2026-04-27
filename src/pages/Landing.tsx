import { useNavigate } from "react-router-dom";
import { ArrowRight, Route, Truck, MapPin, BarChart3, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import heroImg from "@/assets/hero-logistics.jpg";
import featRoutes from "@/assets/feature-routes.jpg";
import featFleet from "@/assets/feature-fleet.jpg";
import featDelivery from "@/assets/feature-delivery.jpg";

const features = [
  { icon: Route, title: "Planificación de rutas", desc: "Crea, asigna y despacha rutas optimizadas por zona y capacidad de vehículo." },
  { icon: Truck, title: "Gestión de flota", desc: "Controla vehículos, capacidades y conductores asignados desde un solo panel." },
  { icon: MapPin, title: "Seguimiento en terreno", desc: "Los conductores registran cada parada, novedad y entrega en tiempo real." },
  { icon: BarChart3, title: "Indicadores claros", desc: "Visualiza entregas exitosas, fallidas y novedades en cada cierre de ruta." },
  { icon: ShieldCheck, title: "Roles y permisos", desc: "Acceso seguro para Despachador, Conductor y Administrador de Flota." },
  { icon: Clock, title: "Operación 24/7", desc: "Diseñado para responder a la operación logística sin pausas ni errores." },
];

const steps = [
  { n: "01", title: "Despachador planifica", desc: "Agrupa paquetes por zona y crea rutas listas para despacho.", img: featRoutes },
  { n: "02", title: "Asigna conductor y vehículo", desc: "Cada conductor opera con su vehículo asignado por la empresa.", img: featFleet },
  { n: "03", title: "Conductor entrega y reporta", desc: "Confirma entregas, novedades y cierra la ruta desde su móvil.", img: featDelivery },
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
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="#how" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
          </nav>
          <button onClick={() => navigate("/login")} className="btn-primary text-sm flex items-center gap-2">
            Iniciar sesión <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-16 min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Camiones de carga en autopista al atardecer" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
          <div className="absolute inset-0" style={{ background: "var(--gradient-overlay)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-primary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Plataforma profesional de logística
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              Gestiona tus <span className="gradient-primary-text">rutas y flota</span> con precisión.
            </h1>
            <p className="text-lg text-subtle mb-8 max-w-xl leading-relaxed">
              LogisticsRoutes centraliza la planificación de rutas, asignación de conductores y seguimiento de entregas en una plataforma diseñada para operaciones reales.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate("/login")} className="btn-primary flex items-center gap-2">
                Acceder a la plataforma <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#features" className="btn-secondary">Conocer más</a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              {[
                { v: "100%", l: "Trazabilidad" },
                { v: "3", l: "Roles operativos" },
                { v: "24/7", l: "Disponibilidad" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl md:text-3xl font-bold gradient-primary-text">{s.v}</div>
                  <div className="text-xs text-subtle mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative card-elevated p-6 glow-primary">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-subtle">Ruta activa</div>
                <span className="text-xs font-semibold text-primary">EN TRÁNSITO</span>
              </div>
              <div className="text-2xl font-bold mb-1">R-2047 · Zona Norte</div>
              <div className="text-sm text-subtle mb-6">Carlos Mendoza · Van XYZ-456</div>

              <div className="space-y-3">
                {[
                  { addr: "Cra 15 #22-30", status: "Exitosa" },
                  { addr: "Cl 30 #18-12", status: "Exitosa" },
                  { addr: "Av Libertador #45", status: "En curso" },
                  { addr: "Cra 8 #12-05", status: "Pendiente" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      p.status === "Exitosa" ? "bg-success/20 text-[hsl(var(--success))]" :
                      p.status === "En curso" ? "bg-primary/20 text-primary" : "bg-white/10 text-white/60"
                    }`}>{i + 1}</div>
                    <div className="flex-1 text-sm">{p.addr}</div>
                    {p.status === "Exitosa" && <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))]" />}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-xs">
                <span className="text-subtle">Progreso</span>
                <span className="font-semibold">2 / 4 entregas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Características</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Todo lo que tu operación necesita</h2>
            <p className="text-subtle text-lg">Una plataforma diseñada para los flujos reales de despacho, conducción y administración de flota.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-navy p-7 hover:border-primary/40 transition-all duration-300 group">
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

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 bg-[hsl(var(--surface-1))]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Cómo funciona</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Del despacho a la entrega</h2>
            <p className="text-subtle text-lg">Tres pasos claros que conectan a todo el equipo operativo.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="card-navy overflow-hidden group">
                <div className="relative h-52 overflow-hidden">
                  <img src={s.img} alt={s.title} loading="lazy" width={1024} height={768} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary text-[hsl(var(--primary-foreground))] text-xs font-bold">
                    PASO {s.n}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-subtle text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contacto" className="py-24 px-6">
        <div className="max-w-4xl mx-auto card-elevated p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Listo para empezar?</h2>
            <p className="text-subtle text-lg mb-8 max-w-xl mx-auto">
              Ingresa con tus credenciales asignadas por el administrador y comienza a operar.
            </p>
            <button onClick={() => navigate("/login")} className="btn-primary inline-flex items-center gap-2">
              Iniciar sesión <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-soft mt-6">¿No tienes cuenta? Contacta al administrador de flota de tu empresa.</p>
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
