import Navbar from "@/components/Navbar";
import DespachadorSidebar from "@/components/DespachadorSidebar";
import StatusBadge, { getRouteStatusVariant } from "@/components/StatusBadge";
import { useRutasHistorial } from "@/hooks/rutas/useRutasHistorial";

export default function DespachadorHistorialPage() {
  const { data: rutas = [], isLoading, isError } = useRutasHistorial();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Despachador Logístico" />
      <div className="flex flex-1">
        <DespachadorSidebar activePage="Historial" />
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Historial de Rutas</h1>

          {isLoading && <p className="text-white/60 text-sm">Cargando historial…</p>}

          {isError && (
            <p className="text-[#e05555] text-sm">No se pudo cargar el historial de rutas.</p>
          )}

          {!isLoading && !isError && (
            <div className="card-navy overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {[
                      "ID Ruta",
                      "Zona",
                      "Fecha Cierre",
                      "Conductor",
                      "Vehículo",
                      "Exitosas",
                      "Fallidas",
                      "Novedades",
                      "Estado",
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left text-xs font-semibold text-white/60 px-4 py-3"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rutas.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-white/40 py-8 text-sm">
                        No hay rutas cerradas en el historial.
                      </td>
                    </tr>
                  ) : (
                    rutas.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-sm font-semibold text-white">{r.id}</td>
                        <td className="px-4 py-3 text-sm text-white">{r.zona}</td>
                        <td className="px-4 py-3 text-sm text-white">
                          {r.fechaCierre
                            ? new Date(r.fechaCierre).toLocaleDateString("es-CO")
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {r.conductorAsignado ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {r.vehiculoAsignado ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#4caf82] font-semibold">
                          {r.resumen?.exitosas ?? 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-destructive font-semibold">
                          {r.resumen?.fallidas ?? 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-primary font-semibold">
                          {r.resumen?.novedades ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={getRouteStatusVariant(r.estado)}>
                            {r.estado}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
