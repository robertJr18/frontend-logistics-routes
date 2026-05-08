import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, Timer } from "lucide-react";
import Navbar from "@/components/Navbar";
import DespachadorSidebar from "@/components/DespachadorSidebar";
import StatusBadge from "@/components/StatusBadge";
import { derivarAlertas } from "@/lib/alertas";
import { useRutas } from "@/hooks/rutas/useRutas";

export default function DespachadorAlertasPage() {
  const navigate = useNavigate();
  const { data: rutas = [], isLoading } = useRutas();
  const alertas = useMemo(() => derivarAlertas(rutas), [rutas]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" />
      <div className="flex flex-1">
        <DespachadorSidebar activePage="Alertas" />
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Alertas del Sistema</h1>

          {isLoading && <p className="text-white/60 text-sm">Cargando alertas…</p>}

          {!isLoading && alertas.length === 0 && (
            <div className="card-navy p-8 text-center text-white/40 text-sm">
              No hay alertas activas en este momento.
            </div>
          )}

          <div className="space-y-4">
            {alertas.map((a) => (
              <div
                key={a.id}
                className={`card-navy p-5 border-l-4 ${
                  a.tipo === "urgente" ? "border-l-destructive" : "border-l-primary"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      a.tipo === "urgente" ? "bg-destructive/20" : "bg-primary/20"
                    }`}
                  >
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
                        <Timer className="w-3 h-3" /> {new Date(a.fecha).toLocaleString("es-CO")}
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
