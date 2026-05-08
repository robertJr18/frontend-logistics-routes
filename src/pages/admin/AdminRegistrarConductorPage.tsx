import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useRegistrarConductor } from "@/hooks/conductores/useRegistrarConductor";
import { toRegistrarConductorRequest } from "@/services/mappers/conductor";
import { ApiError } from "@/services/api";
import type { ModeloContrato } from "@/types/domain";

const MODELOS: ModeloContrato[] = ["Recorrido completo", "Por parada"];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminRegistrarConductorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const registrar = useRegistrarConductor();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [modeloContrato, setModeloContrato] = useState<ModeloContrato>("Por parada");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es requerido";
    else if (nombre.length > 200) newErrors.nombre = "Máximo 200 caracteres";
    if (!email.trim()) newErrors.email = "El email es requerido";
    else if (!EMAIL_REGEX.test(email)) newErrors.email = "Formato de email inválido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await registrar.mutateAsync(
        toRegistrarConductorRequest({ nombre, email, modeloContrato }),
      );
      toast({
        title: "Conductor registrado",
        description: `${nombre} registrado exitosamente.`,
      });
      navigate("/admin");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ email: "Este email ya está registrado." });
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
          description: "No se pudo registrar el conductor.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" backTo="/admin" />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-white mb-8">Registrar Conductor</h1>
        <div className="card-navy p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Información del Conductor</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-white/60 text-sm font-medium mb-1 block">
                Nombre Completo
              </label>
              <input
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  setErrors((p) => ({ ...p, nombre: "" }));
                }}
                placeholder="Ej: Juan Pérez"
                className="w-full input-dark px-4 py-3 text-sm"
              />
              {errors.nombre && <p className="text-[#e05555] text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="conductor@empresa.com"
                className="w-full input-dark px-4 py-3 text-sm"
              />
              {errors.email && <p className="text-[#e05555] text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-white/60 text-sm font-medium mb-1 block">
                Modelo de Contrato
              </label>
              <select
                value={modeloContrato}
                onChange={(e) => setModeloContrato(e.target.value as ModeloContrato)}
                className="w-full input-dark px-4 py-3 text-sm"
              >
                {MODELOS.map((m) => (
                  <option key={m} value={m} className="bg-card">
                    {m}
                  </option>
                ))}
              </select>
              <p className="text-white/50 text-xs mt-1">
                Define cómo se liquida al conductor en cada cierre de ruta.
              </p>
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
            {registrar.isPending ? "Registrando…" : "Registrar conductor"}
          </button>
        </div>
      </main>
    </div>
  );
}
