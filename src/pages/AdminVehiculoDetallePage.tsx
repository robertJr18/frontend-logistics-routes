import { useParams, useNavigate } from "react-router-dom";
import { Truck, MapPin, User, Weight, Box } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, { getVehicleStatusVariant } from "@/components/StatusBadge";
import { vehiculos, rutas } from "@/data/mockData";

export default function AdminVehiculoDetallePage() {
  const { placa } = useParams();
  const navigate = useNavigate();
  const vehiculo = vehiculos.find(v => v.placa === placa);

  if (!vehiculo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Administrador de Flota" backTo="/admin" />
        <div className="flex-1 flex items-center justify-center text-white">Vehículo no encontrado</div>
      </div>
    );
  }

  const rutasVehiculo = rutas.filter(r => r.vehiculoAsignado === vehiculo.placa);
  const rutaActiva = rutasVehiculo.find(r => r.estado === "En Tránsito" || r.estado === "Confirmada");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo="/admin" />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Detalle del Vehículo</h1>
          <div className="flex gap-3">
            {vehiculo.estado !== "En Tránsito" && (
              <button onClick={() => navigate(`/admin/vehiculo/${vehiculo.placa}/editar`)} className="btn-primary text-sm !py-2 !px-4">
                Editar vehículo
              </button>
            )}
          </div>
        </div>

        {/* Info card */}
        <div className="card-navy p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{vehiculo.tipo} — {vehiculo.placa}</h2>
                <p className="text-white/60 text-sm">{vehiculo.modelo}</p>
              </div>
            </div>
            <StatusBadge variant={getVehicleStatusVariant(vehiculo.estado)}>{vehiculo.estado}</StatusBadge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Weight className="w-4 h-4 text-white/40" />
                <div>
                  <p className="text-white/60 text-xs">Capacidad de Peso</p>
                  <p className="text-white font-semibold">{vehiculo.capacidadPeso.toLocaleString()} kg</p>
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
                  <p className="text-white font-semibold">{vehiculo.conductorAsignado || "Sin asignar"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active route */}
        {rutaActiva && (
          <div className="card-navy p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Ruta Activa</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-white font-semibold">Ruta #{rutaActiva.id}</p>
                <p className="text-white/60 text-sm">{rutaActiva.zona}, {rutaActiva.ciudad} · {rutaActiva.paquetes.length} paquetes · {rutaActiva.pesoTotal} kg</p>
              </div>
              <StatusBadge variant={rutaActiva.estado === "En Tránsito" ? "en-transito" : "confirmada"}>{rutaActiva.estado}</StatusBadge>
            </div>
          </div>
        )}

        {/* Route history */}
        <div className="card-navy p-6">
          <h3 className="text-lg font-bold text-white mb-4">Historial de Rutas</h3>
          {rutasVehiculo.length === 0 ? (
            <p className="text-white/60 text-sm">Este vehículo no ha sido asignado a ninguna ruta.</p>
          ) : (
            <div className="space-y-3">
              {rutasVehiculo.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm">{r.id}</span>
                    <span className="text-white/60 text-sm">{r.zona}, {r.ciudad}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">{r.paquetes.length} paq · {r.pesoTotal} kg</span>
                    <StatusBadge variant={r.estado === "En Tránsito" ? "en-transito" : r.estado === "Confirmada" ? "confirmada" : "creada"}>{r.estado}</StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-start mt-6">
          <button onClick={() => navigate("/admin")} className="btn-secondary">Volver</button>
        </div>
      </main>
    </div>
  );
}
