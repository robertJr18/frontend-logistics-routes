import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, { getRouteStatusVariant } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useRutaById } from "@/hooks/rutas/useRutaById";
import { useForzarCierreRuta } from "@/hooks/despacho/useForzarCierreRuta";
import { ApiError } from "@/services/api";
import { capacidadVehiculo } from "@/types/domain";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DespachadorDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: ruta, isLoading, isError } = useRutaById(id);
  const forzarCierre = useForzarCierreRuta();

  const [excludedPkgs, setExcludedPkgs] = useState<Set<string>>(new Set());

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Despachador Logístico" backTo="/despachador" />
        <div className="flex-1 flex items-center justify-center text-white/60">Cargando…</div>
      </div>
    );
  }

  if (isError || !ruta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Despachador Logístico" backTo="/despachador" />
        <div className="flex-1 flex items-center justify-center text-white">Ruta no encontrada</div>
      </div>
    );
  }

  const canEdit = ruta.estado === "Creada" || ruta.estado === "Lista para Despacho";
  const paquetesActivos = ruta.paquetes.filter((p) => !excludedPkgs.has(p.id));
  const capacidad = capacidadVehiculo[ruta.vehiculoRequerido];
  const porcentaje = Math.min((ruta.pesoTotal / capacidad) * 100, 100);

  const toggleExclude = (pkgId: string) => {
    setExcludedPkgs((prev) => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId);
      else next.add(pkgId);
      return next;
    });
  };

  const handleForzarCierre = async () => {
    try {
      await forzarCierre.mutateAsync(ruta.id);
      toast({ title: "Ruta cerrada", description: `Ruta ${ruta.id} cerrada forzosamente.` });
      navigate("/despachador");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof ApiError ? `Error ${err.status}` : "No se pudo forzar el cierre.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" backTo="/despachador" />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Header card */}
        <div className="card-navy p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Ruta #{ruta.id}</h1>
              <p className="text-white/60 text-sm">{ruta.zona}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{ruta.estado}</StatusBadge>
              {ruta.estado === "En Tránsito" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-sm !py-2 !px-4 rounded-md bg-[#e05555]/20 text-[#e05555] hover:bg-[#e05555]/30 transition-colors">
                      Forzar cierre
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Forzar cierre de la ruta {ruta.id}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        La ruta pasará a estado <strong>Cerrada Forzada</strong>. Las paradas
                        pendientes quedarán sin gestión del conductor. Esta acción no se puede
                        deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleForzarCierre}
                        disabled={forzarCierre.isPending}
                      >
                        {forzarCierre.isPending ? "Cerrando…" : "Sí, forzar cierre"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <span className="text-white/60">Fecha límite despacho</span>
              <p className="text-white font-semibold">
                {new Date(ruta.fechaLimiteDespacho).toLocaleString("es-CO")}
              </p>
            </div>
            <div>
              <span className="text-white/60">Tipo de vehículo</span>
              <p className="text-white font-semibold">{ruta.vehiculoRequerido}</p>
            </div>
            <div>
              <span className="text-white/60">Paquetes incluidos</span>
              <p className="text-white font-semibold">
                {paquetesActivos.length} de {ruta.paquetes.length}
              </p>
            </div>
            <div>
              <span className="text-white/60">Peso acumulado</span>
              <p className="text-white font-semibold">
                {ruta.pesoTotal} kg / {capacidad.toLocaleString()} kg
              </p>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${porcentaje > 90 ? "bg-[#e05555]" : "bg-primary"}`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>
          <p className="text-right text-xs text-white/60 mt-1">
            {Math.round(porcentaje)}% de capacidad
          </p>
        </div>

        {/* Package table */}
        <div className="card-navy overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Paquetes ({ruta.paquetes.length})</h2>
            {canEdit && excludedPkgs.size > 0 && (
              <span className="text-primary text-sm font-medium">
                {excludedPkgs.size} excluido(s) localmente
              </span>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {canEdit && (
                  <th className="text-center text-xs font-semibold text-white/60 px-4 py-3 w-16">
                    Incluir
                  </th>
                )}
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                  ID Paquete
                </th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                  Dirección destino
                </th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                  Tipo Mercancía
                </th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                  Fecha límite entrega
                </th>
              </tr>
            </thead>
            <tbody>
              {ruta.paquetes.map((pkg) => {
                const isExcluded = excludedPkgs.has(pkg.id);
                return (
                  <tr
                    key={pkg.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-opacity ${isExcluded ? "opacity-40" : ""}`}
                  >
                    {canEdit && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleExclude(pkg.id)}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                            isExcluded
                              ? "border-[#e05555] bg-[#e05555]/20 text-[#e05555]"
                              : "border-[#4caf82] bg-[#4caf82]/20 text-[#4caf82]"
                          }`}
                        >
                          {isExcluded ? <X className="w-3.5 h-3.5" /> : "✓"}
                        </button>
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm font-semibold text-white">{pkg.id}</td>
                    <td className="px-4 py-3 text-sm text-white">{pkg.direccion}</td>
                    <td className="px-4 py-3 text-sm">
                      {pkg.tipoPaquete === "FRAGIL" ? (
                        <StatusBadge variant="warning">FRÁGIL</StatusBadge>
                      ) : (
                        <span className="text-white">{pkg.tipoPaquete}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">
                      {pkg.fechaLimiteEntrega || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate("/despachador")} className="btn-secondary">
            Volver
          </button>
          {canEdit && (
            <button
              onClick={() => navigate(`/despachador/despacho/${ruta.id}`)}
              className="btn-primary"
            >
              Confirmar despacho
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
