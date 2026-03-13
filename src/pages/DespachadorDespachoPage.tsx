import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, { getRouteStatusVariant } from "@/components/StatusBadge";
import { rutas, vehiculos, conductores } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function DespachadorDespachoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const ruta = rutas.find(r => r.id === id);

  const [selectedConductor, setSelectedConductor] = useState<string | null>(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);
  const [excludedPkgs, setExcludedPkgs] = useState<Set<string>>(new Set());

  if (!ruta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Despachador Logístico" backTo="/despachador" />
        <div className="flex-1 flex items-center justify-center text-white">Ruta no encontrada</div>
      </div>
    );
  }

  const paquetesActivos = ruta.paquetes.filter(p => !excludedPkgs.has(p.id));
  const pesoActual = Math.round(paquetesActivos.reduce((sum, p) => sum + p.peso, 0) * 10) / 10;

  const conductoresDisponibles = conductores.filter(c => c.estado === "Activo");

  const toggleExclude = (pkgId: string) => {
    setExcludedPkgs(prev => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId);
      else next.add(pkgId);
      return next;
    });
  };

  const handleConfirm = () => {
    if (!selectedConductor || !selectedVehiculo) return;
    if (paquetesActivos.length === 0) {
      toast({ title: "Error", description: "Debes incluir al menos un paquete.", variant: "destructive" });
      return;
    }
    toast({
      title: "Despacho confirmado",
      description: `Ruta ${ruta.id} asignada con ${paquetesActivos.length} paquetes · ${pesoActual} kg.`,
    });
    navigate("/despachador");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" backTo="/despachador" />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Route summary */}
        <div className="card-navy p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Confirmar Despacho — Ruta #{ruta.id}</h1>
              <p className="text-white/60 text-sm">{ruta.zona}, {ruta.ciudad}</p>
            </div>
            <StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{ruta.estado}</StatusBadge>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-white/60">Paquetes incluidos</span>
              <p className="text-white font-semibold">{paquetesActivos.length} de {ruta.paquetes.length}</p>
            </div>
            <div>
              <span className="text-white/60">Peso total</span>
              <p className="text-white font-semibold">{pesoActual} kg</p>
            </div>
            <div>
              <span className="text-white/60">Tipo requerido</span>
              <p className="text-white font-semibold">{ruta.vehiculoRequerido}</p>
            </div>
            <div>
              <span className="text-white/60">Motivo despacho</span>
              <p className="text-primary font-semibold">{ruta.motivoDespacho}</p>
            </div>
          </div>
        </div>

        {/* Package list with exclusion */}
        <div className="card-navy overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Paquetes de la ruta</h2>
            {excludedPkgs.size > 0 && (
              <span className="text-primary text-sm font-medium">{excludedPkgs.size} excluido(s)</span>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-center text-xs font-semibold text-white/60 px-4 py-3 w-16">Incluir</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">ID Paquete</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Dirección</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Peso</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {ruta.paquetes.map((pkg) => {
                const isExcluded = excludedPkgs.has(pkg.id);
                return (
                  <tr key={pkg.id} className={`border-b border-white/5 hover:bg-white/5 transition-opacity ${isExcluded ? "opacity-40" : ""}`}>
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
                    <td className="px-4 py-3 text-sm font-semibold text-white">{pkg.id}</td>
                    <td className="px-4 py-3 text-sm text-white">{pkg.direccion}, {pkg.zona}</td>
                    <td className="px-4 py-3 text-sm text-white">{pkg.peso} kg</td>
                    <td className="px-4 py-3 text-sm">
                      {pkg.tipoPaquete === "FRAGIL" ? (
                        <StatusBadge variant="warning">FRÁGIL</StatusBadge>
                      ) : (
                        <span className="text-white">{pkg.tipoPaquete}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Conductor + Vehicle selection */}
        <div className="card-navy p-5 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Seleccionar Conductor y Vehículo</h2>
          <div className="space-y-3">
            {conductoresDisponibles.map((c) => {
              const isSelected = selectedConductor === c.id;
              const vehiculoAsoc = c.vehiculoAsignado
                ? vehiculos.find(v => v.placa === c.vehiculoAsignado)
                : null;
              const isInRoute = vehiculoAsoc?.estado === "En Tránsito";
              const noVehicle = !c.vehiculoAsignado;
              const isDisabled = !!isInRoute || noVehicle;
              return (
                <button
                  key={c.id}
                  disabled={isDisabled}
                  onClick={() => {
                    setSelectedConductor(c.id);
                    if (c.vehiculoAsignado) setSelectedVehiculo(c.vehiculoAsignado);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : isDisabled
                      ? "border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">{c.nombre}</p>
                      <p className="text-white/60 text-xs">
                        {vehiculoAsoc
                          ? `${vehiculoAsoc.tipo} ${vehiculoAsoc.placa} · ${vehiculoAsoc.capacidadPeso.toLocaleString()} kg`
                          : "Sin vehículo asignado"}
                        {isInRoute && " · En ruta"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {vehiculoAsoc && (
                        <StatusBadge variant={vehiculoAsoc.estado === "Disponible" ? "disponible" : vehiculoAsoc.estado === "En Tránsito" ? "en-transito-vehicle" : "inactivo"}>
                          {vehiculoAsoc.estado}
                        </StatusBadge>
                      )}
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/despachador")} className="btn-secondary">
            Cancelar
          </button>
          <div className="flex items-center gap-4">
            {(!selectedConductor || !selectedVehiculo) && (
              <span className="text-[#e05555] text-sm font-medium">Selecciona conductor y vehículo</span>
            )}
            <button
              onClick={handleConfirm}
              disabled={!selectedConductor || !selectedVehiculo}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirmar despacho y generar manifiesto
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
