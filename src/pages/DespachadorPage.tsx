import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { rutas, type Ruta, type Parada } from "@/data/mockData";
import {
  LayoutDashboard,
  Route,
  Radio,
  AlertTriangle,
  History,
  X,
  Trash2,
  Filter,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/despachador" },
  { label: "Rutas Planificadas", icon: Route, path: "/despachador" },
  { label: "Rutas Activas", icon: Radio, path: "/despachador/activas" },
  { label: "Alertas", icon: AlertTriangle, path: "/despachador/alertas" },
  { label: "Historial", icon: History, path: "/despachador/historial" },
];

function estadoVariant(estado: Ruta["estado"]) {
  switch (estado) {
    case "Lista para Despacho": return "warning" as const;
    case "En Tránsito": return "info" as const;
    case "Completada": return "success" as const;
    case "Con Novedades": return "danger" as const;
  }
}

export default function DespachadorPage() {
  const [alertVisible, setAlertVisible] = useState(true);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);
  const [zonaFilter, setZonaFilter] = useState("Todas");

  const zonas = ["Todas", ...new Set(rutas.map((r) => r.zona))];
  const filtered = zonaFilter === "Todas" ? rutas : rutas.filter((r) => r.zona === zonaFilter);

  return (
    <DashboardLayout title="Rutas Planificadas" items={sidebarItems} alertCount={2}>
      {/* Alert banner */}
      {alertVisible && (
        <div className="mb-4 flex items-center justify-between bg-primary/15 border border-primary/30 rounded-lg px-4 py-3 text-sm">
          <span>⚠️ 2 paquetes están próximos a vencer su fecha límite de entrega</span>
          <button onClick={() => setAlertVisible(false)} className="p-1 hover:bg-primary/20 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <StatusBadge variant="warning">{filtered.length} rutas</StatusBadge>
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={zonaFilter}
              onChange={(e) => setZonaFilter(e.target.value)}
              className="bg-muted border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {zonas.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Route cards */}
      <div className="grid gap-4">
        {filtered.map((ruta) => (
          <div
            key={ruta.id}
            className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 flex-1">
                <div>
                  <p className="text-xs text-muted-foreground">Ruta</p>
                  <p className="text-sm font-semibold">{ruta.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Zona</p>
                  <p className="text-sm">{ruta.zona}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paquetes</p>
                  <p className="text-sm">{ruta.paquetes} paquetes</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="text-sm">{ruta.pesoActual} kg / {ruta.pesoMax} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehículo</p>
                  <p className="text-sm">{ruta.vehiculoTipo} — {ruta.vehiculoPlaca}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conductor</p>
                  <p className="text-sm">{ruta.conductor}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <StatusBadge variant={estadoVariant(ruta.estado)}>{ruta.estado}</StatusBadge>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setSelectedRuta(ruta)}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Ver detalle
                </button>
                {ruta.estado === "Lista para Despacho" && (
                  <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                    Confirmar Despacho
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Route className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No hay rutas planificadas</p>
        </div>
      )}

      {/* Detail slide-over */}
      {selectedRuta && (
        <SlideOver ruta={selectedRuta} onClose={() => setSelectedRuta(null)} />
      )}
    </DashboardLayout>
  );
}

function SlideOver({ ruta, onClose }: { ruta: Ruta; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-popover border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold">{ruta.id}</h2>
            <p className="text-sm text-muted-foreground">{ruta.zona} — {ruta.conductor}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-3">
          {ruta.paradas.map((parada) => (
            <div
              key={parada.numero}
              className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3"
            >
              <span className="shrink-0 h-7 w-7 flex items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                {parada.numero}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{parada.paquete.direccion}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{parada.paquete.id}</span>
                  <StatusBadge
                    variant={parada.paquete.tipoPaquete === "Frágil" ? "warning" : "neutral"}
                  >
                    {parada.paquete.tipoPaquete}
                  </StatusBadge>
                  <span>{parada.paquete.peso} kg</span>
                </div>
              </div>
              <button className="p-1.5 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded transition-colors" title="Excluir paquete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-border">
          <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            Confirmar Despacho
          </button>
        </div>
      </div>
    </div>
  );
}
