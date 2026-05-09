import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRutaActiva } from "@/hooks/conductor/useRutaActiva";
import { useCerrarRuta } from "@/hooks/conductor/useCerrarRuta";
import { ApiError } from "@/services/api";

export default function ConductorCierrePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: ruta, isLoading } = useRutaActiva();
  const cerrar = useCerrarRuta();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60">Cargando…</div>
    );
  }

  if (!ruta) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        No hay ruta activa.
      </div>
    );
  }

  const resumen = ruta.resumen ?? {
    exitosas: ruta.paradas.filter((p) => p.status === "Exitosa").length,
    fallidas: ruta.paradas.filter((p) => p.status === "Fallida").length,
    novedades: ruta.paradas.filter((p) => p.status === "Novedad").length,
    sinGestion: ruta.paradas.filter((p) => p.status === "Pendiente").length,
    total: ruta.paradas.length,
  };

  const handleClose = async () => {
    try {
      await cerrar.mutateAsync({
        rutaId: ruta.id,
        confirmarConPendientes: resumen.sinGestion > 0,
      });
      toast({
        title: "Ruta cerrada",
        description:
          "El informe de cierre ha sido enviado al Sistema de Facturación y Liquidación.",
      });
      navigate("/portal");
    } catch (err) {
      const description =
        err instanceof ApiError && err.status === 409
          ? "Aún hay paradas pendientes. Vuelve a la ruta o confirma con pendientes."
          : "No se pudo cerrar la ruta.";
      toast({ variant: "destructive", title: "Error", description });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button
            onClick={() => navigate("/conductor")}
            className="text-white/60 hover:text-white text-sm"
          >
            ← Volver
          </button>
        </div>

        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-white mb-6">
            Cierre de Ruta #{ruta.id.slice(0, 8)}
          </h1>

          <div className="card-navy p-5 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{resumen.total}</p>
                <p className="text-white/60 text-sm">Total paradas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#4caf82]">{resumen.exitosas}</p>
                <p className="text-white/60 text-sm">Exitosas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{resumen.fallidas}</p>
                <p className="text-white/60 text-sm">Fallidas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#e05555]">{resumen.sinGestion}</p>
                <p className="text-white/60 text-sm">Sin gestionar</p>
              </div>
            </div>
          </div>

          {resumen.sinGestion > 0 && (
            <div className="bg-[#e05555]/10 border border-[#e05555]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#e05555] flex-shrink-0 mt-0.5" />
              <p className="text-white text-sm">
                Tienes <strong>{resumen.sinGestion} paradas sin gestionar</strong>. Si cierras
                ahora, el sistema las marcará automáticamente como{" "}
                <em>'Sin gestión del conductor'</em>.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {resumen.sinGestion > 0 && (
              <button
                onClick={() => navigate("/conductor")}
                className="btn-primary w-full text-center"
              >
                Gestionar paradas pendientes
              </button>
            )}
            <button
              onClick={handleClose}
              disabled={cerrar.isPending}
              className="btn-secondary w-full text-center disabled:opacity-50"
            >
              {cerrar.isPending ? "Cerrando…" : "Confirmar cierre de ruta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
