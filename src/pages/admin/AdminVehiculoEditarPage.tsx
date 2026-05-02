import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { vehiculos, zonas, capacidadVehiculo, VehicleType } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function AdminVehiculoEditarPage() {
  const { placa } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const vehiculo = vehiculos.find(v => v.placa === placa);

  const [tipo, setTipo] = useState<VehicleType>(vehiculo?.tipo || "Moto");
  const [modelo, setModelo] = useState(vehiculo?.modelo || "");
  const [capacidad, setCapacidad] = useState(vehiculo?.capacidadPeso || 0);
  const [volumen, setVolumen] = useState(vehiculo?.volumenMax || 0);
  const [zona, setZona] = useState(vehiculo?.zona || zonas[0]);
  const [estado, setEstado] = useState<"Disponible" | "Inactivo">(
    vehiculo?.estado === "Inactivo" ? "Inactivo" : "Disponible"
  );

  if (!vehiculo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar title="Administrador de Flota" backTo="/admin" />
        <div className="flex-1 flex items-center justify-center text-white">Vehículo no encontrado</div>
      </div>
    );
  }

  const handleTipoChange = (t: VehicleType) => {
    setTipo(t);
    setCapacidad(capacidadVehiculo[t]);
  };

  const handleSave = () => {
    if (!modelo) {
      toast({ title: "Error", description: "El modelo es requerido.", variant: "destructive" });
      return;
    }
    if (capacidad <= 0 || volumen <= 0) {
      toast({ title: "Error", description: "Capacidad y volumen deben ser mayores a cero.", variant: "destructive" });
      return;
    }
    toast({ title: "Vehículo actualizado", description: `${tipo} ${vehiculo.placa} guardado exitosamente.` });
    navigate(`/admin/vehiculo/${vehiculo.placa}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo={`/admin/vehiculo/${vehiculo.placa}`} />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-8">Editar Vehículo — {vehiculo.placa}</h1>

        <div className="card-navy p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Información del Vehículo</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Placa (read-only) */}
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Placa</label>
              <input value={vehiculo.placa} disabled className="w-full input-dark px-4 py-3 text-sm opacity-50 cursor-not-allowed" />
            </div>

            {/* Tipo */}
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Tipo</label>
              <select
                value={tipo}
                onChange={e => handleTipoChange(e.target.value as VehicleType)}
                className="w-full input-dark px-4 py-3 text-sm"
              >
                {(["Moto", "Van", "NHR", "Turbo"] as VehicleType[]).map(t => (
                  <option key={t} value={t} className="bg-card">{t}</option>
                ))}
              </select>
              <p className="text-primary text-xs mt-1">Sugerido: {capacidadVehiculo[tipo].toLocaleString()} kg</p>
            </div>

            {/* Modelo */}
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Modelo</label>
              <input value={modelo} onChange={e => setModelo(e.target.value)} className="w-full input-dark px-4 py-3 text-sm" />
            </div>

            {/* Capacidad */}
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Capacidad de Peso (kg)</label>
              <input type="number" value={capacidad} onChange={e => setCapacidad(Number(e.target.value))} className="w-full input-dark px-4 py-3 text-sm" />
            </div>

            {/* Volumen */}
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Volumen Máximo (m³)</label>
              <input type="number" value={volumen} onChange={e => setVolumen(Number(e.target.value))} className="w-full input-dark px-4 py-3 text-sm" />
            </div>

            {/* Zona */}
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Zona de Operación</label>
              <select value={zona} onChange={e => setZona(e.target.value)} className="w-full input-dark px-4 py-3 text-sm">
                {zonas.map(z => <option key={z} value={z} className="bg-card">{z}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div className="col-span-2">
              <label className="text-white/60 text-sm font-medium mb-1 block">Estado</label>
              <div className="flex gap-3">
                {(["Disponible", "Inactivo"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setEstado(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      estado === s ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate(`/admin/vehiculo/${vehiculo.placa}`)} className="btn-secondary">Cancelar</button>
          <button onClick={handleSave} className="btn-primary">Guardar cambios</button>
        </div>
      </main>
    </div>
  );
}
