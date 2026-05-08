import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useConductores } from "@/hooks/conductores/useConductores";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useAsignarVehiculoConductor } from "@/hooks/conductores/useAsignarVehiculoConductor";
import { ApiError } from "@/services/api";

export default function AdminAsignacionesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: conductores = [], isLoading: cargandoConductores } = useConductores();
  const { data: vehiculos = [], isLoading: cargandoVehiculos } = useVehiculos();
  const asignar = useAsignarVehiculoConductor();

  const [selectedConductor, setSelectedConductor] = useState<string | null>(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);

  const conductoresSinVehiculo = conductores.filter(
    (c) => c.estado === "Activo" && !c.vehiculoAsignado,
  );
  const vehiculosSinConductor = vehiculos.filter(
    (v) => v.estado === "Disponible" && !v.conductorAsignado,
  );

  const conductorSel = conductores.find((c) => c.id === selectedConductor);
  const vehiculoSel = vehiculos.find((v) => v.id === selectedVehiculo);

  const handleAssign = async () => {
    if (!selectedConductor || !selectedVehiculo) return;
    try {
      await asignar.mutateAsync({
        conductorId: selectedConductor,
        vehiculoId: selectedVehiculo,
      });
      toast({
        title: "Asignación exitosa",
        description: `${conductorSel?.nombre} asignado a ${vehiculoSel?.placa}.`,
      });
      setSelectedConductor(null);
      setSelectedVehiculo(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({
          variant: "destructive",
          title: "Asignación bloqueada",
          description:
            "El conductor ya tiene vehículo asignado o el vehículo no está disponible.",
        });
      } else if (err instanceof ApiError && err.status === 404) {
        toast({
          variant: "destructive",
          title: "No encontrado",
          description: "Conductor o vehículo no existen.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo completar la asignación.",
        });
      }
    }
  };

  const cargando = cargandoConductores || cargandoVehiculos;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo="/admin" />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-8">Asignación Conductor — Vehículo</h1>

        {cargando ? (
          <p className="text-white/60 text-sm">Cargando…</p>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Conductores sin vehículo asignado
              </h2>
              <div className="space-y-3">
                {conductoresSinVehiculo.length === 0 ? (
                  <p className="text-white/60 text-sm">
                    Todos los conductores activos tienen vehículo asignado.
                  </p>
                ) : (
                  conductoresSinVehiculo.map((c) => (
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
                          <p className="text-white/50 text-xs">{c.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge variant="disponible">Activo</StatusBadge>
                            <span className="text-white/50 text-xs">{c.modeloContrato}</span>
                          </div>
                        </div>
                        {selectedConductor === c.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Vehículos disponibles sin conductor
              </h2>
              <div className="space-y-3">
                {vehiculosSinConductor.length === 0 ? (
                  <p className="text-white/60 text-sm">
                    No hay vehículos disponibles sin conductor.
                  </p>
                ) : (
                  vehiculosSinConductor.map((v) => (
                    <div
                      key={v.id}
                      className={`card-navy p-4 cursor-pointer border-2 transition-colors ${
                        selectedVehiculo === v.id ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => setSelectedVehiculo(v.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">
                            {v.tipo} {v.placa}
                          </p>
                          <p className="text-white/60 text-xs">
                            {v.zona} · {v.capacidadPeso.toLocaleString()} kg
                          </p>
                        </div>
                        {selectedVehiculo === v.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {selectedConductor && selectedVehiculo && (
          <div className="card-navy p-4 mt-6 flex items-center justify-between">
            <p className="text-white font-semibold">
              Asignar <span className="text-primary">{conductorSel?.nombre}</span> a{" "}
              <span className="text-primary">{vehiculoSel?.placa}</span>
            </p>
            <button
              onClick={handleAssign}
              disabled={asignar.isPending}
              className="btn-primary disabled:opacity-50"
            >
              {asignar.isPending ? "Asignando…" : "Confirmar asignación"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
