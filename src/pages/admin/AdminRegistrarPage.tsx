import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { capacidadVehiculo, VehicleType } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useRegistrarVehiculo } from "@/hooks/vehiculos/useRegistrarVehiculo";
import { toVehiculoRequest } from "@/services/mappers/vehiculo";
import { ApiError } from "@/services/api";
import { zonasOperacion } from "@/lib/zonas";

const PLACA_REGEX = /^[A-Z]{3}[0-9]{2,3}[A-Z]?$/;

export default function AdminRegistrarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const registrar = useRegistrarVehiculo();

  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState<VehicleType>("Moto");
  const [modelo, setModelo] = useState("");
  const [capacidad, setCapacidad] = useState(capacidadVehiculo["Moto"]);
  const [volumen, setVolumen] = useState<number>(0);
  const [zonaLabel, setZonaLabel] = useState(zonasOperacion[0].label);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTipoChange = (t: VehicleType) => {
    setTipo(t);
    setCapacidad(capacidadVehiculo[t]);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!placa) newErrors.placa = "Placa requerida";
    else if (!PLACA_REGEX.test(placa))
      newErrors.placa = "Formato inválido. Ej: MNT478, BDR921, KLM30A";
    if (!modelo) newErrors.modelo = "Modelo requerido";
    if (capacidad <= 0) newErrors.capacidad = "La capacidad debe ser mayor a cero";
    if (volumen <= 0) newErrors.volumen = "El volumen debe ser mayor a cero";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await registrar.mutateAsync(
        toVehiculoRequest({ placa, tipo, modelo, capacidad, volumen, zonaLabel }),
      );
      toast({
        title: "Vehículo registrado",
        description: `${tipo} ${placa} registrado exitosamente.`,
      });
      navigate("/admin");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ placa: "Esta placa ya está registrada." });
      } else if (err instanceof ApiError && (err.status === 422 || err.status === 400)) {
        toast({
          variant: "destructive",
          title: "Datos inválidos",
          description: "Revisa los campos del formulario.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo registrar el vehículo.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo="/admin" />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-8">Registrar Vehículo</h1>

        <div className="card-navy p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Información del Vehículo</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Placa</label>
              <input
                value={placa}
                onChange={(e) => {
                  setPlaca(e.target.value.toUpperCase());
                  setErrors((prev) => ({ ...prev, placa: "" }));
                }}
                placeholder="MNT478"
                className="w-full input-dark px-4 py-3 text-sm"
              />
              {errors.placa && <p className="text-[#e05555] text-xs mt-1">{errors.placa}</p>}
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => handleTipoChange(e.target.value as VehicleType)}
                className="w-full input-dark px-4 py-3 text-sm"
              >
                {(["Moto", "Van", "NHR", "Turbo"] as VehicleType[]).map((t) => (
                  <option key={t} value={t} className="bg-[#314595]">
                    {t}
                  </option>
                ))}
              </select>
              <p className="text-primary text-xs mt-1">
                Capacidad sugerida: {capacidadVehiculo[tipo].toLocaleString()} kg
              </p>
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Modelo</label>
              <input
                value={modelo}
                onChange={(e) => {
                  setModelo(e.target.value);
                  setErrors((prev) => ({ ...prev, modelo: "" }));
                }}
                placeholder="Ej: Chevrolet N300"
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
                  setErrors((prev) => ({ ...prev, capacidad: "" }));
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
                  setErrors((prev) => ({ ...prev, volumen: "" }));
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
                  <option key={z.geohash} value={z.label} className="bg-[#314595]">
                    {z.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate("/admin")} className="btn-secondary">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={registrar.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {registrar.isPending ? "Registrando…" : "Registrar vehículo"}
          </button>
        </div>
      </main>
    </div>
  );
}
