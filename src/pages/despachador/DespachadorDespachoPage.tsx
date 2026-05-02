import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Edit2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, { getRouteStatusVariant } from "@/components/StatusBadge";
import { rutas, vehiculos, conductores } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function DespachadorDespachoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const ruta = rutas.find(r => r.id === id);

  const [excludedPkgs, setExcludedPkgs] = useState<Set<string>>(new Set());
  const [editingConductor, setEditingConductor] = useState(false);

  // Find first available conductor (with vehicle, not in transit)
  const conductoresDisponibles = conductores.filter(c => {
    if (c.estado !== "Activo" || !c.vehiculoAsignado) return false;
    const v = vehiculos.find(v => v.placa === c.vehiculoAsignado);
    return v && v.estado !== "En Tránsito";
  });

  const [selectedConductor, setSelectedConductor] = useState<string | null>(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);

  // Auto-assign first available conductor on mount
  useEffect(() => {
    if (conductoresDisponibles.length > 0 && !selectedConductor) {
      const first = conductoresDisponibles[0];
      setSelectedConductor(first.id);
      setSelectedVehiculo(first.vehiculoAsignado);
    }
  }, []);

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

  const conductorSeleccionado = conductores.find(c => c.id === selectedConductor);
  const vehiculoAsoc = conductorSeleccionado?.vehiculoAsignado
    ? vehiculos.find(v => v.placa === conductorSeleccionado.vehiculoAsignado)
    : null;

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
      description: `Ruta ${ruta.id} asignada a ${conductorSeleccionado?.nombre} con ${paquetesActivos.length} paquetes · ${pesoActual} kg.`,
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
              <p className="text-primary font-semibold">{ruta.motivoDespacho || "Manual"}</p>
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
                            ? "border-destructive bg-destructive/20 text-destructive"
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

        {/* Conductor + Vehicle — auto-assigned, editable */}
        <div className="card-navy p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Conductor y Vehículo Asignado</h2>
            {!editingConductor && selectedConductor && (
              <button onClick={() => setEditingConductor(true)} className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                <Edit2 className="w-3.5 h-3.5" /> Cambiar
              </button>
            )}
          </div>

          {!editingConductor && selectedConductor ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-primary bg-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{conductorSeleccionado?.nombre}</p>
                <p className="text-white/60 text-sm">
                  {vehiculoAsoc
                    ? `${vehiculoAsoc.tipo} ${vehiculoAsoc.placa} · ${vehiculoAsoc.capacidadPeso.toLocaleString()} kg`
                    : "Sin vehículo"}
                </p>
              </div>
              <span className="text-white/40 text-xs italic">Asignado por el sistema</span>
            </div>
          ) : !editingConductor && !selectedConductor ? (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
              <p className="text-white/60 text-sm">No hay conductores disponibles con vehículo asignado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-white/60 text-sm mb-2">Selecciona un conductor diferente:</p>
              {conductoresDisponibles.map((c) => {
                const isSelected = selectedConductor === c.id;
                const vAsoc = c.vehiculoAsignado ? vehiculos.find(v => v.placa === c.vehiculoAsignado) : null;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedConductor(c.id);
                      if (c.vehiculoAsignado) setSelectedVehiculo(c.vehiculoAsignado);
                      setEditingConductor(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      isSelected ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{c.nombre}</p>
                        <p className="text-white/60 text-xs">
                          {vAsoc ? `${vAsoc.tipo} ${vAsoc.placa} · ${vAsoc.capacidadPeso.toLocaleString()} kg` : "Sin vehículo"}
                        </p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </button>
                );
              })}
              <button onClick={() => setEditingConductor(false)} className="text-white/40 text-sm hover:text-white">Cancelar</button>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/despachador")} className="btn-secondary">Cancelar</button>
          <button
            onClick={handleConfirm}
            disabled={!selectedConductor || !selectedVehiculo || paquetesActivos.length === 0}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar despacho y generar manifiesto
          </button>
        </div>
      </main>
    </div>
  );
}
