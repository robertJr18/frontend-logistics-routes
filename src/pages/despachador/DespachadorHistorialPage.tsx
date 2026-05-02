import { useNavigate } from "react-router-dom";
import { Route as RouteIcon, Bell, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, { getRouteStatusVariant } from "@/components/StatusBadge";
import { rutas } from "@/data/mockData";

const sidebarItems = [
  { label: "Rutas", icon: RouteIcon, badge: null },
  { label: "Alertas", icon: Bell, badge: "2" },
  { label: "Historial", icon: Clock, badge: null },
];

// Simulated closed routes
const rutasCerradas = [
  {
    id: "R-2038", zona: "Zona Gaira", ciudad: "Santa Marta", estado: "Cerrada Manual" as const,
    fecha: "2026-03-08", conductor: "Carlos Mendoza", vehiculo: "ABC-001",
    resumen: { exitosas: 4, fallidas: 1, novedades: 0, total: 5 },
  },
  {
    id: "R-2035", zona: "Zona El Prado", ciudad: "Barranquilla", estado: "Cerrada Automática" as const,
    fecha: "2026-03-06", conductor: "Luisa Fernández", vehiculo: "PQR-110",
    resumen: { exitosas: 15, fallidas: 2, novedades: 1, total: 18 },
  },
  {
    id: "R-2031", zona: "Zona Centro", ciudad: "Santa Marta", estado: "Cerrada Forzada" as const,
    fecha: "2026-03-04", conductor: "Tomás Rivera", vehiculo: "DEF-330",
    resumen: { exitosas: 8, fallidas: 3, novedades: 2, total: 13 },
  },
];

export default function DespachadorHistorialPage() {
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
                else if (item.label === "Alertas") navigate("/despachador/alertas");
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left ${
                item.label === "Historial" ? "bg-card text-white" : "text-white/60 hover:text-white hover:bg-white/5"
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
          <h1 className="text-2xl font-bold text-white mb-6">Historial de Rutas</h1>
          <div className="card-navy overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["ID Ruta", "Zona", "Fecha Cierre", "Conductor", "Vehículo", "Exitosas", "Fallidas", "Novedades", "Estado"].map(col => (
                    <th key={col} className="text-left text-xs font-semibold text-white/60 px-4 py-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rutasCerradas.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-sm font-semibold text-white">{r.id}</td>
                    <td className="px-4 py-3 text-sm text-white">{r.zona}, {r.ciudad}</td>
                    <td className="px-4 py-3 text-sm text-white">{r.fecha}</td>
                    <td className="px-4 py-3 text-sm text-white">{r.conductor}</td>
                    <td className="px-4 py-3 text-sm text-white">{r.vehiculo}</td>
                    <td className="px-4 py-3 text-sm text-[#4caf82] font-semibold">{r.resumen.exitosas}</td>
                    <td className="px-4 py-3 text-sm text-destructive font-semibold">{r.resumen.fallidas}</td>
                    <td className="px-4 py-3 text-sm text-primary font-semibold">{r.resumen.novedades}</td>
                    <td className="px-4 py-3"><StatusBadge variant={getRouteStatusVariant(r.estado)}>{r.estado}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
