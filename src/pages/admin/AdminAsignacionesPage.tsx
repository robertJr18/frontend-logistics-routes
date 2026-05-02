import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { vehiculos, conductores } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function AdminAsignacionesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedConductor, setSelectedConductor] = useState<string | null>(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);

  const conductoresSinVehiculo = conductores.filter(c => c.estado === "Activo" && !c.vehiculoAsignado);
  const vehiculosSinConductor = vehiculos.filter(v => v.estado === "Disponible" && !v.conductorAsignado);

  const conductorNombre = conductores.find(c => c.id === selectedConductor)?.nombre;
  const vehiculoPlaca = selectedVehiculo;

  const handleAssign = () => {
    if (!selectedConductor || !selectedVehiculo) return;
    toast({
      title: "Asignación exitosa",
      description: `${conductorNombre} asignado a ${vehiculoPlaca}.`,
    });
    setSelectedConductor(null);
    setSelectedVehiculo(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo="/admin" />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-8">Asignación Conductor — Vehículo</h1>

        <div className="grid grid-cols-2 gap-6">
          {/* Conductores */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Conductores sin vehículo asignado</h2>
            <div className="space-y-3">
              {conductoresSinVehiculo.length === 0 ? (
                <p className="text-white/60 text-sm">Todos los conductores tienen vehículo asignado.</p>
              ) : (
                conductoresSinVehiculo.map(c => (
                  <div
                    key={c.id}
                    className={`card-navy p-4 cursor-pointer border-2 transition-colors ${
                      selectedConductor === c.id ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedConductor(c.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{c.nombre}</p>
                        <StatusBadge variant="disponible">Activo</StatusBadge>
                      </div>
                      {selectedConductor === c.id && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vehículos */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Vehículos disponibles sin conductor</h2>
            <div className="space-y-3">
              {vehiculosSinConductor.length === 0 ? (
                <p className="text-white/60 text-sm">No hay vehículos disponibles sin conductor.</p>
              ) : (
                vehiculosSinConductor.map(v => (
                  <div
                    key={v.placa}
                    className={`card-navy p-4 cursor-pointer border-2 transition-colors ${
                      selectedVehiculo === v.placa ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedVehiculo(v.placa)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{v.tipo} {v.placa}</p>
                        <p className="text-white/60 text-xs">{v.zona} · {v.capacidadPeso.toLocaleString()} kg</p>
                      </div>
                      {selectedVehiculo === v.placa && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Confirmation bar */}
        {selectedConductor && selectedVehiculo && (
          <div className="card-navy p-4 mt-6 flex items-center justify-between">
            <p className="text-white font-semibold">
              Asignar <span className="text-primary">{conductorNombre}</span> a <span className="text-primary">{vehiculoPlaca}</span>
            </p>
            <button onClick={handleAssign} className="btn-primary">
              Confirmar asignación
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
