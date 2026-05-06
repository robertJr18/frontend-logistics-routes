import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import StatusBadge, { getStopStatusVariant, getRouteStatusVariant } from "@/components/StatusBadge";
import { rutas } from "@/data/mockData";
import { useAuth } from "@/auth/useAuth";

export default function ConductorPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const ruta = rutas.find(r => r.id === "R-2049")!;
  const [estado, setEstado] = useState<"Confirmada" | "En Tránsito">(ruta.estado === "Confirmada" ? "Confirmada" : "En Tránsito");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  const paradas = ruta.paradas;
  const allManaged = paradas.every(p => p.status !== "Pendiente");
  const pendientes = paradas.filter(p => p.status === "Pendiente").length;

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={handleLogout} className="text-white/60 hover:text-white text-sm">← Salir</button>
          <span className="text-white font-bold text-sm">Mi Ruta</span>
          <span className="text-white/60 text-sm">Tomás Rivera</span>
        </div>
        <div className="card-navy mx-4 mt-4 p-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-white">Ruta #{ruta.id}</h1>
            <StatusBadge variant={getRouteStatusVariant(estado)}>{estado}</StatusBadge>
          </div>
          <p className="text-white/60 text-sm">{ruta.zona}, {ruta.ciudad}</p>
          <p className="text-white/60 text-sm">{paradas.length} paradas · {ruta.pesoTotal} kg · NHR {ruta.vehiculoAsignado}</p>
        </div>
        {estado === "Confirmada" && (
          <div className="mx-4 mt-4">
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
              <p className="text-primary text-sm font-medium">Tu ruta está lista. Verifica que todos los paquetes están cargados antes de salir.</p>
            </div>
            <button onClick={() => setEstado("En Tránsito")} className="btn-primary w-full text-center">Confirmar Inicio de Tránsito</button>
          </div>
        )}
        {estado === "En Tránsito" && (
          <div className="px-4 mt-4 space-y-3 pb-24">
            {paradas.map((parada) => (
              <div key={parada.numero} className="card-navy p-4">
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${parada.status === "Exitosa" ? "bg-[#4caf82]" : parada.status === "Fallida" ? "bg-[#e05555]" : "bg-primary"}`}>
                    {parada.status === "Exitosa" ? <Check className="w-4 h-4" /> : parada.status === "Fallida" ? <X className="w-4 h-4" /> : parada.numero}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold text-sm">{parada.destinatario}</p>
                      <StatusBadge variant={getStopStatusVariant(parada.status)}>{parada.status}</StatusBadge>
                    </div>
                    <p className="text-white/60 text-xs mt-1">{parada.direccion}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/40 text-xs">{parada.paqueteId}</span>
                      <span className="text-white/40 text-xs">{parada.peso} kg</span>
                    </div>
                    {parada.motivoFallo && <p className="text-[#e05555] text-xs mt-1">{parada.motivoFallo}</p>}
                    {parada.status === "Pendiente" && (
                      <button onClick={() => navigate(`/conductor/parada/${parada.numero}`)} className="btn-primary text-xs !py-2 !px-4 mt-3">Gestionar</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {estado === "En Tránsito" && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 bg-background border-t border-white/10">
            <button onClick={() => navigate("/conductor/cierre")} className={`w-full text-center ${allManaged ? "btn-primary" : "btn-secondary"}`}>
              Cerrar Ruta {!allManaged && `(${pendientes} pendientes)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
