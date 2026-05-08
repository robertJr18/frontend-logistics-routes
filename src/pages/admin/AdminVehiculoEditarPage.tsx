import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { capacidadVehiculo, VehicleType } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useVehiculoByPlaca } from "@/hooks/vehiculos/useVehiculoByPlaca";
import { useActualizarVehiculo } from "@/hooks/vehiculos/useActualizarVehiculo";
import { toActualizarVehiculoRequest } from "@/services/mappers/vehiculo";
import { ApiError } from "@/services/api";
import { zonasOperacion } from "@/lib/zonas";

export default function AdminVehiculoEditarPage() {
  const { placa } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: vehiculo, isLoading, isError } = useVehiculoByPlaca(placa);
  const actualizar = useActualizarVehiculo();

  const [tipo, setTipo] = useState<VehicleType>("Moto");
  const [modelo, setModelo] = useState("");
  const [capacidad, setCapacidad] = useState(0);
  const [volumen, setVolumen] = useState(0);
  const [zonaLabel, setZonaLabel] = useState(zonasOperacion[0].label);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    if (vehiculo && !hidratado) {
      setTipo(vehiculo.tipo);
      setModelo(vehiculo.modelo);
      setCapacidad(vehiculo.capacidadPeso);
      setVolumen(vehiculo.volumenMax);
      setZonaLabel(vehiculo.zona);
      setHidratado(true);
    }
  }, [vehiculo, hidratado]);

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

  const handleTipoChange = (t: VehicleType) => {
    setTipo(t);
    setCapacidad(capacidadVehiculo[t]);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!modelo) newErrors.modelo = "El modelo es requerido";
    if (capacidad <= 0) newErrors.capacidad = "La capacidad debe ser mayor a cero";
    if (volumen <= 0) newErrors.volumen = "El volumen debe ser mayor a cero";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await actualizar.mutateAsync({
        id: vehiculo.id,
        req: toActualizarVehiculoRequest({
          placa: vehiculo.placa,
          tipo,
          modelo,
          capacidad,
          volumen,
          zonaLabel,
        }),
      });
      toast({
        title: "Vehículo actualizado",
        description: `${tipo} ${vehiculo.placa} guardado exitosamente.`,
      });
      navigate(`/admin/vehiculo/${vehiculo.placa}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast({
          variant: "destructive",
          title: "No se pudo actualizar",
          description: "El vehículo está en tránsito o hay conflicto con la placa.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo guardar los cambios.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo={`/admin/vehiculo/${vehiculo.placa}`} />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-8">Editar Vehículo — {vehiculo.placa}</h1>

        <div className="card-navy p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Información del Vehículo</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Placa</label>
              <input
                value={vehiculo.placa}
                disabled
                className="w-full input-dark px-4 py-3 text-sm opacity-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => handleTipoChange(e.target.value as VehicleType)}
                className="w-full input-dark px-4 py-3 text-sm"
              >
                {(["Moto", "Van", "NHR", "Turbo"] as VehicleType[]).map((t) => (
                  <option key={t} value={t} className="bg-card">
                    {t}
                  </option>
                ))}
              </select>
              <p className="text-primary text-xs mt-1">
                Sugerido: {capacidadVehiculo[tipo].toLocaleString()} kg
              </p>
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Modelo</label>
              <input
                value={modelo}
                onChange={(e) => {
                  setModelo(e.target.value);
                  setErrors((p) => ({ ...p, modelo: "" }));
                }}
                className="w-full input-dark px-4 py-3 text-sm"
              />
              {errors.modelo && <p className="text-[#e05555] text-xs mt-1">{errors.modelo}</p>}
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">
                Capacidad de Peso (kg)
              </label>
              <input
                type="number"
                value={capacidad}
                onChange={(e) => {
                  setCapacidad(Number(e.target.value));
                  setErrors((p) => ({ ...p, capacidad: "" }));
                }}
                className="w-full input-dark px-4 py-3 text-sm"
              />
              {errors.capacidad && (
                <p className="text-[#e05555] text-xs mt-1">{errors.capacidad}</p>
              )}
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">
                Volumen Máximo (m³)
              </label>
              <input
                type="number"
                value={volumen}
                onChange={(e) => {
                  setVolumen(Number(e.target.value));
                  setErrors((p) => ({ ...p, volumen: "" }));
                }}
                className="w-full input-dark px-4 py-3 text-sm"
              />
              {errors.volumen && <p className="text-[#e05555] text-xs mt-1">{errors.volumen}</p>}
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">
                Zona de Operación
              </label>
              <select
                value={zonaLabel}
                onChange={(e) => setZonaLabel(e.target.value)}
                className="w-full input-dark px-4 py-3 text-sm"
              >
                {zonasOperacion.map((z) => (
                  <option key={z.geohash} value={z.label} className="bg-card">
                    {z.label}
                  </option>
                ))}
                {/* Opción defensiva: si la zona actual del vehículo no está en la tabla, mostrarla igual */}
                {!zonasOperacion.some((z) => z.label === zonaLabel) && (
                  <option value={zonaLabel} className="bg-card">
                    {zonaLabel} (no estándar)
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(`/admin/vehiculo/${vehiculo.placa}`)}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={actualizar.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {actualizar.isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </main>
    </div>
  );
}
