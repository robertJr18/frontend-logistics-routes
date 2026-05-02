import { useNavigate } from "react-router-dom";
import { Route as RouteIcon, Bell, Clock, AlertTriangle, Timer } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";

const sidebarItems = [
  { label: "Rutas", icon: RouteIcon, badge: null },
  { label: "Alertas", icon: Bell, badge: "2" },
  { label: "Historial", icon: Clock, badge: null },
];

const alertas = [
  {
    id: 1,
    tipo: "urgente",
    titulo: "Ruta R-2047 próxima a vencer",
    descripcion: "La ruta tiene plazo de despacho hasta hoy a las 10:00 AM. Tiene 18 paquetes por despachar.",
    fecha: "2026-03-13 07:15",
    accion: "Despachar ahora",
    rutaId: "R-2047",
  },
  {
    id: 2,
    tipo: "urgente",
    titulo: "Ruta R-2048 al 90% de capacidad",
    descripcion: "La ruta alcanzó 448 kg de 500 kg. Se recomienda despachar antes de alcanzar el límite.",
    fecha: "2026-03-13 06:30",
    accion: "Despachar ahora",
    rutaId: "R-2048",
  },
  {
    id: 3,
    tipo: "info",
    titulo: "Parada fallida en R-2050",
    descripcion: "El conductor Carlos Mendoza reportó cliente ausente en la parada 2 de la ruta R-2050.",
    fecha: "2026-03-12 15:45",
    accion: null,
    rutaId: "R-2050",
  },
  {
    id: 4,
    tipo: "info",
    titulo: "Ruta R-2049 confirmada",
    descripcion: "La ruta R-2049 fue confirmada exitosamente y asignada al conductor Tomás Rivera con el NHR DEF-330.",
    fecha: "2026-03-12 08:00",
    accion: null,
    rutaId: "R-2049",
  },
];

export default function DespachadorAlertasPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" />
      <div className="flex flex-1">
        <aside className="w-60 border-r border-white/10 p-4 flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "Rutas") navigate("/despachador");
                else if (item.label === "Historial") navigate("/despachador/historial");
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left ${
                item.label === "Alertas" ? "bg-card text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-destructive text-white text-xs px-2 py-0.5 rounded-full font-bold">{item.badge}</span>
              )}
            </button>
          ))}
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Alertas del Sistema</h1>
          <div className="space-y-4">
            {alertas.map(a => (
              <div
                key={a.id}
                className={`card-navy p-5 border-l-4 ${
                  a.tipo === "urgente" ? "border-l-destructive" : "border-l-primary"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    a.tipo === "urgente" ? "bg-destructive/20" : "bg-primary/20"
                  }`}>
                    {a.tipo === "urgente" ? (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    ) : (
                      <Bell className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold">{a.titulo}</p>
                      {a.tipo === "urgente" && <StatusBadge variant="danger">Urgente</StatusBadge>}
                    </div>
                    <p className="text-white/60 text-sm mb-2">{a.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {a.fecha}
                      </span>
                      {a.accion && (
                        <button
                          onClick={() => navigate(`/despachador/despacho/${a.rutaId}`)}
                          className="btn-primary text-xs !py-2 !px-4"
                        >
                          {a.accion}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
