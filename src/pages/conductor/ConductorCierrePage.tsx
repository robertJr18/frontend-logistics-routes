import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { rutas } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function ConductorCierrePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const ruta = rutas.find(r => r.id === "R-2049")!;

  const exitosas = ruta.paradas.filter(p => p.status === "Exitosa").length;
  const fallidas = ruta.paradas.filter(p => p.status === "Fallida").length;
  const novedades = ruta.paradas.filter(p => p.status === "Novedad").length;
  const sinGestionar = ruta.paradas.filter(p => p.status === "Pendiente").length;

  const handleClose = () => {
    toast({
      title: "Ruta cerrada",
      description: "El informe de cierre ha sido enviado al Sistema de Facturación y Liquidación.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button onClick={() => navigate("/conductor")} className="text-white/60 hover:text-white text-sm">
            ← Volver
          </button>
        </div>

        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-white mb-6">Cierre de Ruta #{ruta.id}</h1>

          {/* Summary */}
          <div className="card-navy p-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{ruta.paradas.length}</p>
                <p className="text-white/60 text-sm">Total paradas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#4caf82]">{exitosas}</p>
                <p className="text-white/60 text-sm">Exitosas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{fallidas}</p>
                <p className="text-white/60 text-sm">Fallidas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#e05555]">{sinGestionar}</p>
                <p className="text-white/60 text-sm">Sin gestionar</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          {sinGestionar > 0 && (
            <div className="bg-[#e05555]/10 border border-[#e05555]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#e05555] flex-shrink-0 mt-0.5" />
              <p className="text-white text-sm">
                Tienes <strong>{sinGestionar} paradas sin gestionar</strong>. Si cierras ahora, el sistema las marcará automáticamente como <em>'Sin gestión del conductor'</em>.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {sinGestionar > 0 && (
              <button
                onClick={() => navigate("/conductor")}
                className="btn-primary w-full text-center"
              >
                Gestionar paradas pendientes
              </button>
            )}
            <button
              onClick={handleClose}
              className="btn-secondary w-full text-center"
            >
              Confirmar cierre de ruta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
