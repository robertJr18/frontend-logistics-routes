import { useParams, useNavigate } from "react-router-dom";
import { Truck, MapPin, User, Weight, Box } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, {
  getRouteStatusVariant,
  getVehicleStatusVariant,
} from "@/components/StatusBadge";
import { useVehiculoByPlaca } from "@/hooks/vehiculos/useVehiculoByPlaca";
import { useDarDeBajaVehiculo } from "@/hooks/vehiculos/useDarDeBajaVehiculo";
import { useRutas } from "@/hooks/rutas/useRutas";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/services/api";
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

export default function AdminVehiculoDetallePage() {
  const { placa } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: vehiculo, isLoading, isError } = useVehiculoByPlaca(placa);
  const darDeBaja = useDarDeBajaVehiculo();
  const { data: todasRutas = [] } = useRutas();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Administrador de Flota" backTo="/admin" />
        <div className="flex-1 flex items-center justify-center text-white/60">Cargando…</div>
      </div>
    );
  }

  if (isError || !vehiculo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Administrador de Flota" backTo="/admin" />
        <div className="flex-1 flex items-center justify-center text-white">
          Vehículo no encontrado
        </div>
      </div>
    );
  }

  const isTransit = vehiculo.estado === "En Tránsito";

  const rutasDelVehiculo = todasRutas.filter((r) => r.vehiculoAsignado === vehiculo.placa);
  const rutaActiva = rutasDelVehiculo.find(
    (r) => r.estado === "En Tránsito" || r.estado === "Confirmada",
  );

  const handleDarDeBaja = async () => {
    try {
      await darDeBaja.mutateAsync(vehiculo.id);
      toast({
        title: "Vehículo dado de baja",
        description: `${vehiculo.placa} marcado como inactivo.`,
      });
      navigate("/admin");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({
          variant: "destructive",
          title: "No se puede dar de baja",
          description: "El vehículo está en tránsito.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo dar de baja el vehículo.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo="/admin" />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Detalle del Vehículo</h1>
          <div className="flex gap-3">
            {!isTransit && (
              <button
                onClick={() => navigate(`/admin/vehiculo/${vehiculo.placa}/editar`)}
                className="btn-primary text-sm !py-2 !px-4"
              >
                Editar vehículo
              </button>
            )}
            {!isTransit && vehiculo.estado !== "Inactivo" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-sm !py-2 !px-4 rounded-md bg-[#e05555]/20 text-[#e05555] hover:bg-[#e05555]/30 transition-colors">
                    Dar de baja
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Dar de baja {vehiculo.placa}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El vehículo pasará a estado <strong>Inactivo</strong> y dejará de aparecer en
                      la planificación de rutas. Esta acción se puede revertir solo desde el
                      backend.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDarDeBaja} disabled={darDeBaja.isPending}>
                      {darDeBaja.isPending ? "Dando de baja…" : "Sí, dar de baja"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="card-navy p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {vehiculo.tipo} — {vehiculo.placa}
                </h2>
                <p className="text-white/60 text-sm">{vehiculo.modelo}</p>
              </div>
            </div>
            <StatusBadge variant={getVehicleStatusVariant(vehiculo.estado)}>
              {vehiculo.estado}
            </StatusBadge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Weight className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-white/60 text-xs">Capacidad de Peso</p>
                  <p className="text-white font-semibold">
                    {vehiculo.capacidadPeso.toLocaleString()} kg
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-white/60 text-xs">Volumen Máximo</p>
                  <p className="text-white font-semibold">{vehiculo.volumenMax} m³</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-white/60 text-xs">Zona de Operación</p>
                  <p className="text-white font-semibold">{vehiculo.zona}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-white/60 text-xs">Conductor Asignado</p>
                  <p className="text-white font-semibold">
                    {vehiculo.conductorAsignado || "Sin asignar"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ruta Activa */}
        {rutaActiva && (
          <div className="card-navy p-6 mb-4">
            <h2 className="text-lg font-semibold text-white mb-3">Ruta Activa</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{rutaActiva.id}</p>
                <p className="text-white/60 text-sm">{rutaActiva.zona}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm">
                  {rutaActiva.paradas.filter((p) => p.status === "Exitosa").length}/
                  {rutaActiva.paradas.length} paradas
                </span>
                <StatusBadge variant={getRouteStatusVariant(rutaActiva.estado)}>
                  {rutaActiva.estado}
                </StatusBadge>
              </div>
            </div>
          </div>
        )}

        {/* Historial de Rutas del Vehículo */}
        {rutasDelVehiculo.length > 0 && (
          <div className="card-navy p-6 mb-4">
            <h2 className="text-lg font-semibold text-white mb-3">Rutas Asignadas</h2>
            <div className="space-y-2">
              {rutasDelVehiculo.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <span className="text-white text-sm font-semibold">{r.id}</span>
                    <span className="text-white/50 text-xs ml-3">{r.zona}</span>
                  </div>
                  <StatusBadge variant={getRouteStatusVariant(r.estado)}>{r.estado}</StatusBadge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-start mt-6">
          <button onClick={() => navigate("/admin")} className="btn-secondary">
            Volver
          </button>
        </div>
      </main>
    </div>
  );
}
