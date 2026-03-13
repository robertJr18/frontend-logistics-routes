import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatusBadge, { getRouteStatusVariant } from "@/components/StatusBadge";
import { rutas, capacidadVehiculo } from "@/data/mockData";

export default function DespachadorDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ruta = rutas.find(r => r.id === id);

  if (!ruta) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Despachador Logístico" backTo="/despachador" />
        <div className="flex-1 flex items-center justify-center text-white">Ruta no encontrada</div>
      </div>
    );
  }

  const capacidad = capacidadVehiculo[ruta.vehiculoRequerido];
  const porcentaje = Math.min((ruta.pesoTotal / capacidad) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" backTo="/despachador" />
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {/* Header card */}
        <div className="card-navy p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Ruta #{ruta.id}</h1>
              <p className="text-white/60 text-sm">{ruta.zona}, {ruta.ciudad}</p>
            </div>
            <StatusBadge variant={getRouteStatusVariant(ruta.estado)}>{ruta.estado}</StatusBadge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <span className="text-white/60">Fecha límite despacho</span>
              <p className="text-white font-semibold">{new Date(ruta.fechaLimiteDespacho).toLocaleString("es-CO")}</p>
            </div>
            <div>
              <span className="text-white/60">Vehículo requerido</span>
              <p className="text-white font-semibold">{ruta.vehiculoRequerido}</p>
            </div>
            <div>
              <span className="text-white/60">Peso acumulado</span>
              <p className="text-white font-semibold">{ruta.pesoTotal} kg / {capacidad} kg</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <p className="text-right text-xs text-white/60 mt-1">{Math.round(porcentaje)}% de capacidad</p>
        </div>

        {/* Package table */}
        <div className="card-navy overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">Paquetes ({ruta.paquetes.length})</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">ID Paquete</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Dirección destino</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Peso</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Tipo Mercancía</th>
                <th className="text-left text-xs font-semibold text-white/60 px-4 py-3">Fecha límite entrega</th>
              </tr>
            </thead>
            <tbody>
              {ruta.paquetes.map((pkg) => (
                <tr key={pkg.id} className="border-b border-white/5 hover:bg-white/5">
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
                  <td className="px-4 py-3 text-sm text-white">{pkg.fechaLimiteEntrega}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action bar */}
        <div className="flex justify-between">
          <button onClick={() => navigate("/despachador")} className="btn-secondary">
            Volver
          </button>
          <button className="btn-primary">Despachar ahora</button>
        </div>
      </main>
    </div>
  );
}
