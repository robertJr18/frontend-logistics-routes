import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
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

  if (!ruta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Despachador Logístico" backTo="/despachador" />
        <div className="flex-1 flex items-center justify-center text-white">Ruta no encontrada</div>
      </div>
    );
  }

  const vehiculosDisponibles = vehiculos.filter(
    v => v.tipo === ruta.vehiculoRequerido && v.estado === "Disponible"
  );
  const conductoresDisponibles = conductores.filter(
    c => c.estado === "Activo"
  );

  // Optimized stop order for Barranquilla
  const paradasOptimizadas = [
    "Calle 72 # 45-12, Barranquilla",
    "Calle 84 # 42F-30, Barranquilla",
    "Carrera 51B # 80-254, Barranquilla",
    "Av. Murillo # 37-15, Barranquilla",
    "Calle 17 # 18-22, Soledad",
  ];

  const handleConfirm = () => {
    if (!selectedConductor || !selectedVehiculo) return;
    toast({
      title: "Despacho confirmado",
      description: `Ruta ${ruta.id} asignada. El conductor recibirá la ruta en su dispositivo.`,
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
              <span className="text-white/60">Paquetes</span>
              <p className="text-white font-semibold">{ruta.paquetes.length}</p>
            </div>
            <div>
              <span className="text-white/60">Peso total</span>
              <p className="text-white font-semibold">{ruta.pesoTotal} kg</p>
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

        {/* Two columns: Conductor + Vehicle */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Conductor selection */}
          <div className="card-navy p-5">
            <h2 className="text-lg font-bold text-white mb-4">Seleccionar Conductor</h2>
            <div className="space-y-3">
              {conductoresDisponibles.map((c) => {
                const isSelected = selectedConductor === c.id;
                const vehiculoAsoc = c.vehiculoAsignado
                  ? vehiculos.find(v => v.placa === c.vehiculoAsignado)
                  : null;
                const isInRoute = c.vehiculoAsignado && vehiculoAsoc?.estado === "En Tránsito";
                return (
                  <button
                    key={c.id}
                    disabled={!!isInRoute}
                    onClick={() => {
                      setSelectedConductor(c.id);
                      if (c.vehiculoAsignado) {
                        const v = vehiculos.find(v => v.placa === c.vehiculoAsignado && v.estado === "Disponible" && v.tipo === ruta.vehiculoRequerido);
                        if (v) setSelectedVehiculo(v.placa);
                      }
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : isInRoute
                        ? "border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{c.nombre}</p>
                        <p className="text-white/60 text-xs">
                          {c.vehiculoAsignado ? `${vehiculoAsoc?.tipo} ${c.vehiculoAsignado}` : "Sin vehículo"}
                          {isInRoute && " · En ruta"}
                        </p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle selection */}
          <div className="card-navy p-5">
            <h2 className="text-lg font-bold text-white mb-4">Seleccionar Vehículo Físico</h2>
            <div className="space-y-3">
              {vehiculos
                .filter(v => v.tipo === ruta.vehiculoRequerido)
                .map((v) => {
                  const isSelected = selectedVehiculo === v.placa;
                  const isAvailable = v.estado === "Disponible";
                  return (
                    <button
                      key={v.placa}
                      disabled={!isAvailable}
                      onClick={() => setSelectedVehiculo(v.placa)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : !isAvailable
                          ? "border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">{v.tipo} {v.placa}</p>
                          <p className="text-white/60 text-xs">
                            {v.modelo} · {v.capacidadPeso} kg
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge variant={isAvailable ? "disponible" : "en-mantenimiento"}>
                            {v.estado}
                          </StatusBadge>
                          {isSelected && <Check className="w-5 h-5 text-primary" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Optimized stop order */}
        <div className="card-navy p-5 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Orden de paradas optimizado</h2>
          <div className="space-y-2">
            {paradasOptimizadas.map((addr, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                  {i + 1}
                </span>
                <span className="text-white">{addr}</span>
              </div>
            ))}
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
