import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Edit2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, { getRouteStatusVariant } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { useRutaById } from "@/hooks/rutas/useRutaById";
import { useConductores } from "@/hooks/conductores/useConductores";
import { useVehiculos } from "@/hooks/vehiculos/useVehiculos";
import { useConfirmarDespacho } from "@/hooks/despacho/useConfirmarDespacho";
import { useExcluirPaquete } from "@/hooks/despacho/useExcluirPaquete";
import { ApiError } from "@/services/api";
import type { Conductor, Vehiculo } from "@/types/domain";

type ConductorConVehiculo = { conductor: Conductor; vehiculo: Vehiculo };

export default function DespachadorDespachoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: ruta, isLoading: cargandoRuta } = useRutaById(id);
  const { data: conductores = [] } = useConductores();
  const { data: vehiculos = [] } = useVehiculos();
  const confirmar = useConfirmarDespacho();
  const excluir = useExcluirPaquete();

  const [selectedConductor, setSelectedConductor] = useState<string | null>(null);
  const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);
  const [editingConductor, setEditingConductor] = useState(false);

  const conductoresDisponibles: ConductorConVehiculo[] = conductores
    .filter((c) => c.estado === "Activo" && c.vehiculoAsignado !== null)
    .flatMap((c) => {
      const vehiculo = vehiculos.find(
        (v) => v.placa === c.vehiculoAsignado && v.estado === "Disponible",
      );
      return vehiculo ? [{ conductor: c, vehiculo }] : [];
    });

  const firstConductorId = conductoresDisponibles[0]?.conductor.id ?? null;
  const firstVehiculoId = conductoresDisponibles[0]?.vehiculo.id ?? null;

  useEffect(() => {
    if (firstConductorId && selectedConductor === null) {
      setSelectedConductor(firstConductorId);
      setSelectedVehiculo(firstVehiculoId);
    }
  }, [firstConductorId, firstVehiculoId, selectedConductor]);

  if (cargandoRuta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Despachador Logístico" backTo="/despachador" />
        <div className="flex-1 flex items-center justify-center text-white/60">Cargando…</div>
      </div>
    );
  }

  if (!ruta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Despachador Logístico" backTo="/despachador" />
        <div className="flex-1 flex items-center justify-center text-white">Ruta no encontrada</div>
      </div>
    );
  }

  const conductorSel = conductoresDisponibles.find((x) => x.conductor.id === selectedConductor);

  const handleExcluir = (paqueteId: string) => {
    excluir.mutate(
      { rutaId: ruta.id, paqueteId },
      {
        onError: () =>
          toast({ variant: "destructive", description: "No se pudo excluir el paquete." }),
      },
    );
  };

  const handleConfirm = async () => {
    if (!selectedConductor || !selectedVehiculo) return;
    if (ruta.paquetes.length === 0) {
      toast({ variant: "destructive", description: "La ruta no tiene paquetes activos." });
      return;
    }
    try {
      await confirmar.mutateAsync({
        rutaId: ruta.id,
        req: { conductorId: selectedConductor, vehiculoId: selectedVehiculo },
      });
      toast({
        title: "Despacho confirmado",
        description: `Ruta ${ruta.id} asignada a ${conductorSel?.conductor.nombre} con ${ruta.paquetes.length} paquetes.`,
      });
      navigate("/despachador");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const msg = (err.body as { message?: string })?.message ?? "";
        if (msg.toLowerCase().includes("conductor")) {
          toast({
            variant: "destructive",
            description: "El conductor ya no está activo. Selecciona otro.",
          });
        } else if (
          msg.toLowerCase().includes("vehiculo") ||
          msg.toLowerCase().includes("vehículo")
        ) {
          toast({
            variant: "destructive",
            description: "El vehículo no está disponible. Selecciona otro.",
          });
        } else {
          toast({
            variant: "destructive",
            description: msg || "Conflicto al confirmar el despacho.",
          });
        }
      } else {
        toast({ variant: "destructive", description: "Error al confirmar el despacho." });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" backTo="/despachador" />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Route summary */}
        <div className="card-navy p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Confirmar Despacho — Ruta #{ruta.id}
              </h1>
              <p className="text-white/60 text-sm">{ruta.zona}</p>
            </div>
            <StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{ruta.estado}</StatusBadge>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-white/60">Paquetes activos</span>
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
              <p className="text-primary font-semibold">{ruta.motivoDespacho ?? "Manual"}</p>
            </div>
          </div>
        </div>

        {/* Package list with exclusion */}
        <div className="card-navy overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">
              Paquetes de la ruta ({ruta.paquetes.length})
            </h2>
            <p className="text-white/50 text-xs mt-0.5">
              Haz clic en × para excluir un paquete (acción irreversible).
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-center text-xs font-semibold text-white/60 px-4 py-3 w-16">
                  Excluir
                </th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                  ID Paquete
                </th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">
                  Dirección
                </th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {ruta.paquetes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-white/40 py-8 text-sm">
                    No quedan paquetes activos en esta ruta.
                  </td>
                </tr>
              ) : (
                ruta.paquetes.map((pkg) => {
                  const isExcluding = excluir.isPending && excluir.variables?.paqueteId === pkg.id;
                  return (
                    <tr
                      key={pkg.id}
                      className={`border-b border-white/5 hover:bg-white/5 ${isExcluding ? "opacity-40" : ""}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleExcluir(pkg.id)}
                          disabled={isExcluding}
                          className="w-6 h-6 rounded-md border border-[#e05555] bg-[#e05555]/20 text-[#e05555] flex items-center justify-center hover:bg-[#e05555]/40 transition-colors disabled:opacity-40"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{pkg.id}</td>
                      <td className="px-4 py-3 text-sm text-white">{pkg.direccion}</td>
                      <td className="px-4 py-3 text-sm">
                        {pkg.tipoPaquete === "FRAGIL" ? (
                          <StatusBadge variant="warning">FRÁGIL</StatusBadge>
                        ) : (
                          <span className="text-white">{pkg.tipoPaquete}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Conductor + Vehicle */}
        <div className="card-navy p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Conductor y Vehículo Asignado</h2>
            {!editingConductor && selectedConductor && (
              <button
                onClick={() => setEditingConductor(true)}
                className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
              >
                <Edit2 className="w-3.5 h-3.5" /> Cambiar
              </button>
            )}
          </div>

          {!editingConductor && conductorSel ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-primary bg-primary/10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{conductorSel.conductor.nombre}</p>
                <p className="text-white/60 text-sm">
                  {conductorSel.vehiculo.tipo} {conductorSel.vehiculo.placa} ·{" "}
                  {conductorSel.vehiculo.capacidadPeso.toLocaleString()} kg
                </p>
              </div>
              <span className="text-white/40 text-xs italic">Asignado por el sistema</span>
            </div>
          ) : !editingConductor && !selectedConductor ? (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
              <p className="text-white/60 text-sm">
                No hay conductores activos con vehículo disponible asignado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-white/60 text-sm mb-2">Selecciona un conductor:</p>
              {conductoresDisponibles.map(({ conductor, vehiculo }) => {
                const isSelected = selectedConductor === conductor.id;
                return (
                  <button
                    key={conductor.id}
                    onClick={() => {
                      setSelectedConductor(conductor.id);
                      setSelectedVehiculo(vehiculo.id);
                      setEditingConductor(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{conductor.nombre}</p>
                        <p className="text-white/60 text-xs">
                          {vehiculo.tipo} {vehiculo.placa} ·{" "}
                          {vehiculo.capacidadPeso.toLocaleString()} kg
                        </p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setEditingConductor(false)}
                className="text-white/40 text-sm hover:text-white"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate("/despachador")} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !selectedConductor ||
              !selectedVehiculo ||
              ruta.paquetes.length === 0 ||
              confirmar.isPending
            }
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmar.isPending ? "Confirmando…" : "Confirmar despacho y generar manifiesto"}
          </button>
        </div>
      </main>
    </div>
  );
}
