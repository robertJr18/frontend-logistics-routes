import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

export default function AdminRegistrarConductorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [licencia, setLicencia] = useState("");
  const [turno, setTurno] = useState("06:00 - 14:00");

  const handleSubmit = () => {
    if (!nombre || !cedula || !licencia) {
      toast({ title: "Error", description: "Nombre, cédula y licencia son requeridos.", variant: "destructive" });
      return;
    }
    toast({ title: "Conductor registrado", description: `${nombre} registrado exitosamente.` });
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo="/admin" />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-8">Registrar Conductor</h1>
        <div className="card-navy p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Información del Conductor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Nombre Completo</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" className="w-full input-dark px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Cédula</label>
              <input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Ej: 1234567890" className="w-full input-dark px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Teléfono</label>
              <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Ej: 300 123 4567" className="w-full input-dark px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Nº Licencia</label>
              <input value={licencia} onChange={e => setLicencia(e.target.value)} placeholder="Ej: LIC-001234" className="w-full input-dark px-4 py-3 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-white/60 text-sm font-medium mb-1 block">Turno</label>
              <select value={turno} onChange={e => setTurno(e.target.value)} className="w-full input-dark px-4 py-3 text-sm">
                <option value="06:00 - 14:00" className="bg-card">06:00 - 14:00</option>
                <option value="14:00 - 22:00" className="bg-card">14:00 - 22:00</option>
                <option value="22:00 - 06:00" className="bg-card">22:00 - 06:00</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={() => navigate("/admin")} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} className="btn-primary">Registrar conductor</button>
        </div>
      </main>
    </div>
  );
}
