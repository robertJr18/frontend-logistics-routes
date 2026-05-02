import { useState } from "react";
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

function getTimeRemaining(deadline: string): string {
  const now = new Date("2026-03-13T00:00:00");
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  if (diff <= 0) return "Vencido";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  if (days > 0) return `${days}d ${remainHours}h`;
  return `${remainHours}h`;
}

function isUrgent(deadline: string): boolean {
  const now = new Date("2026-03-13T00:00:00");
  const dl = new Date(deadline);
  return (dl.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;
}

export default function DespachadorPage() {
  const navigate = useNavigate();

  const creadas = rutas.filter(r => r.estado === "Creada");
  const listasDespacho = rutas.filter(r => r.estado === "Lista para Despacho");
  const confirmadas = rutas.filter(r => r.estado === "Confirmada");
  const enTransito = rutas.filter(r => r.estado === "En Tránsito");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" />
      <div className="flex flex-1">
        <aside className="w-60 border-r border-white/10 p-4 flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "Alertas") navigate("/despachador/alertas");
                else if (item.label === "Historial") navigate("/despachador/historial");
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left ${
                item.label === "Rutas" ? "bg-card text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-destructive text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 overflow-auto space-y-6">
          {/* Rutas Creadas */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              Rutas Creadas
              <span className="text-xs font-medium bg-card px-2 py-0.5 rounded-full text-white/60">{creadas.length}</span>
            </h2>
            <div className="card-navy overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["ID Ruta", "Zona", "Paquetes", "Peso", "Vehículo", "Tiempo restante", "Acciones"].map(col => (
                      <th key={col} className="text-left text-xs font-semibold text-white/60 px-4 py-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {creadas.map((ruta) => (
                    <tr key={ruta.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-sm font-semibold text-white">{ruta.id}</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.zona}, {ruta.ciudad}</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.paquetes.length}</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.pesoTotal} kg</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.vehiculoRequerido}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={isUrgent(ruta.fechaLimiteDespacho) ? "text-primary font-bold" : "text-white"}>
                          {getTimeRemaining(ruta.fechaLimiteDespacho)}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => navigate(`/despachador/ruta/${ruta.id}`)} className="btn-secondary text-xs !py-2 !px-3">Ver detalle</button>
                        <button onClick={() => navigate(`/despachador/despacho/${ruta.id}`)} className="btn-primary text-xs !py-2 !px-3">Despachar ahora</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Listas para Despacho */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              Listas para Despacho
              <span className="text-xs font-medium bg-card px-2 py-0.5 rounded-full text-white/60">{listasDespacho.length}</span>
            </h2>
            <div className="card-navy overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["ID Ruta", "Zona", "Paquetes", "Peso", "Vehículo", "Motivo", "Acciones"].map(col => (
                      <th key={col} className="text-left text-xs font-semibold text-white/60 px-4 py-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listasDespacho.map((ruta) => (
                    <tr key={ruta.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 text-sm font-semibold text-white">{ruta.id}</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.zona}, {ruta.ciudad}</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.paquetes.length}</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.pesoTotal} kg</td>
                      <td className="px-4 py-3 text-sm text-white">{ruta.vehiculoRequerido}</td>
                      <td className="px-4 py-3">
                        {ruta.motivoDespacho === "Vencimiento de plazo" ? (
                          <StatusBadge variant="danger">⏰ {ruta.motivoDespacho}</StatusBadge>
                        ) : (
                          <StatusBadge variant="warning">📦 {ruta.motivoDespacho}</StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/despachador/despacho/${ruta.id}`)} className="btn-primary text-xs !py-2 !px-3">Confirmar despacho</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Confirmadas */}
          {confirmadas.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                Confirmadas
                <span className="text-xs font-medium bg-card px-2 py-0.5 rounded-full text-white/60">{confirmadas.length}</span>
              </h2>
              <div className="card-navy p-4 space-y-3">
                {confirmadas.map((ruta) => (
                  <div key={ruta.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold text-sm">{ruta.id}</span>
                      <span className="text-white/60 text-sm">{ruta.zona}, {ruta.ciudad}</span>
                      <StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{ruta.estado}</StatusBadge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>🚛 {ruta.vehiculoAsignado}</span>
                      <span>👤 {ruta.conductorAsignado}</span>
                      <span>{ruta.paquetes.length} paquetes · {ruta.pesoTotal} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* En Tránsito */}
          {enTransito.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                En Tránsito
                <span className="text-xs font-medium bg-card px-2 py-0.5 rounded-full text-white/60">{enTransito.length}</span>
              </h2>
              <div className="card-navy p-4 space-y-3">
                {enTransito.map((ruta) => (
                  <div key={ruta.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold text-sm">{ruta.id}</span>
                      <span className="text-white/60 text-sm">{ruta.zona}, {ruta.ciudad}</span>
                      <StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{ruta.estado}</StatusBadge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>🚛 {ruta.vehiculoAsignado}</span>
                      <span>👤 {ruta.conductorAsignado}</span>
                      <span>{ruta.paradas.filter(p => p.status === "Exitosa").length}/{ruta.paradas.length} paradas</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
