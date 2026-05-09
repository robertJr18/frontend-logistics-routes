import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, AlertTriangle, Upload, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRutaActiva } from "@/hooks/conductor/useRutaActiva";
import { useRegistrarParada } from "@/hooks/conductor/useGestionarParada";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import { ApiError } from "@/services/api";
import { formatMotivoNovedad } from "@/lib/formatters";
import type { MotivoNovedadDto, TipoResultadoParada } from "@/types/dto/parada";

const motivosFallo: MotivoNovedadDto[] = [
  "CLIENTE_AUSENTE",
  "DIRECCION_INCORRECTA",
  "RECHAZADO_POR_CLIENTE",
  "ZONA_DIFICIL_ACCESO",
];

const tiposNovedad: MotivoNovedadDto[] = ["DAÑADO_EN_RUTA", "EXTRAVIADO", "DEVOLUCION"];

export default function ConductorParadaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: ruta, isLoading } = useRutaActiva();
  const registrar = useRegistrarParada();
  const fotoInputRef = useRef<HTMLInputElement | null>(null);

  const parada = ruta?.paradas.find((p) => p.id === id);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [motivoFallo, setMotivoFallo] = useState<MotivoNovedadDto>(motivosFallo[0]);
  const [tipoNovedad, setTipoNovedad] = useState<MotivoNovedadDto>(tiposNovedad[0]);
  const [nombreReceptor, setNombreReceptor] = useState("");
  const [fotoBlob, setFotoBlob] = useState<Blob | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60">Cargando…</div>
    );
  }

  if (!parada) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Parada no encontrada
      </div>
    );
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoBlob(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleConfirm = async (tipo: TipoResultadoParada) => {
    if (tipo === "EXITOSA" && !fotoBlob) {
      toast({
        variant: "destructive",
        title: "Foto requerida",
        description: "Para confirmar entrega exitosa necesitas adjuntar el POD.",
      });
      return;
    }

    try {
      await registrar.mutateAsync({
        paradaId: parada.id,
        req: {
          tipo,
          fechaAccion: new Date().toISOString(),
          nombreReceptor: tipo === "EXITOSA" && nombreReceptor ? nombreReceptor : undefined,
          motivo: tipo === "FALLIDA" ? motivoFallo : tipo === "NOVEDAD" ? tipoNovedad : undefined,
        },
        fotoBlob: tipo === "EXITOSA" && fotoBlob ? fotoBlob : undefined,
      });

      toast({
        title:
          tipo === "EXITOSA"
            ? "Entrega registrada"
            : tipo === "FALLIDA"
              ? "Fallo registrado"
              : "Novedad registrada",
        description: navigator.onLine
          ? `Parada ${parada.numero} actualizada correctamente.`
          : `Parada ${parada.numero} guardada. Se sincronizará al recuperar conexión.`,
      });
      navigate("/conductor");
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 422
          ? "Datos inválidos. Si es entrega exitosa, asegúrate de adjuntar la foto."
          : "No se pudo registrar la gestión.";
      toast({ variant: "destructive", title: "Error", description: msg });
    }
  };

  const totalParadas = ruta?.paradas.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <button
            onClick={() => navigate("/conductor")}
            className="text-white/60 hover:text-white text-sm"
          >
            ← Volver
          </button>
        </div>
        <SyncStatusBar />

        <div className="px-4 py-4">
          <div className="card-navy p-4 mb-6">
            <p className="text-white/60 text-sm mb-1">
              Parada {parada.numero} de {totalParadas}
            </p>
            <h1 className="text-lg font-bold text-white">{parada.direccion}</h1>
            <div className="flex gap-4 mt-2 text-sm text-white/60">
              <span>{parada.paqueteId}</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Entrega Exitosa */}
            <div
              className={`rounded-2xl border-2 transition-colors ${expanded === "exitosa" ? "border-[#4caf82] bg-[#4caf82]/5" : "border-[#4caf82]/30"}`}
            >
              <button
                onClick={() => setExpanded(expanded === "exitosa" ? null : "exitosa")}
                className="w-full p-4 text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#4caf82]/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#4caf82]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Entrega Exitosa</p>
                  <p className="text-white/60 text-xs">
                    Requiere foto de evidencia y firma del receptor
                  </p>
                </div>
              </button>
              {expanded === "exitosa" && (
                <div className="px-4 pb-4 space-y-4">
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fotoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-white/40 transition-colors"
                  >
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="POD"
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">Foto de evidencia (POD)</p>
                        <p className="text-white/40 text-xs">Toca para tomar o subir foto</p>
                      </>
                    )}
                  </button>

                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                    <PenLine className="w-8 h-8 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">Firma del receptor</p>
                    <p className="text-white/40 text-xs">Próximamente disponible</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Nombre del receptor"
                    value={nombreReceptor}
                    onChange={(e) => setNombreReceptor(e.target.value)}
                    className="w-full input-dark px-4 py-3 text-sm"
                  />
                  <button
                    onClick={() => handleConfirm("EXITOSA")}
                    disabled={registrar.isPending || !fotoBlob}
                    className="btn-primary w-full text-center !bg-[#4caf82] disabled:opacity-50"
                  >
                    {registrar.isPending
                      ? navigator.onLine
                        ? "Subiendo y registrando…"
                        : "Guardando offline…"
                      : "Confirmar Entrega"}
                  </button>
                </div>
              )}
            </div>

            {/* Parada Fallida */}
            <div
              className={`rounded-2xl border-2 transition-colors ${expanded === "fallida" ? "border-white/30 bg-white/5" : "border-white/10"}`}
            >
              <button
                onClick={() => setExpanded(expanded === "fallida" ? null : "fallida")}
                className="w-full p-4 text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <p className="text-white font-semibold">Parada Fallida</p>
                  <p className="text-white/60 text-xs">Registrar motivo del fallo</p>
                </div>
              </button>
              {expanded === "fallida" && (
                <div className="px-4 pb-4 space-y-4">
                  <p className="text-white/60 text-xs">Intento 1 de 2</p>
                  <select
                    value={motivoFallo}
                    onChange={(e) => setMotivoFallo(e.target.value as MotivoNovedadDto)}
                    className="w-full input-dark px-4 py-3 text-sm"
                  >
                    {motivosFallo.map((m) => (
                      <option key={m} value={m} className="bg-[#314595]">
                        {formatMotivoNovedad(m)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleConfirm("FALLIDA")}
                    disabled={registrar.isPending}
                    className="btn-primary w-full text-center !bg-[#e05555] disabled:opacity-50"
                  >
                    {registrar.isPending ? "Registrando…" : "Registrar parada fallida"}
                  </button>
                </div>
              )}
            </div>

            {/* Novedad Grave */}
            <div
              className={`rounded-2xl border-2 transition-colors ${expanded === "novedad" ? "border-[#e05555] bg-[#e05555]/5" : "border-[#e05555]/30"}`}
            >
              <button
                onClick={() => setExpanded(expanded === "novedad" ? null : "novedad")}
                className="w-full p-4 text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#e05555]/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#e05555]" />
                </div>
                <div>
                  <p className="text-white font-semibold">Novedad Grave</p>
                  <p className="text-white/60 text-xs">
                    Se notificará al sistema de gestión de paquetes de inmediato
                  </p>
                </div>
              </button>
              {expanded === "novedad" && (
                <div className="px-4 pb-4 space-y-4">
                  <select
                    value={tipoNovedad}
                    onChange={(e) => setTipoNovedad(e.target.value as MotivoNovedadDto)}
                    className="w-full input-dark px-4 py-3 text-sm"
                  >
                    {tiposNovedad.map((t) => (
                      <option key={t} value={t} className="bg-[#314595]">
                        {formatMotivoNovedad(t)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleConfirm("NOVEDAD")}
                    disabled={registrar.isPending}
                    className="btn-primary w-full text-center !bg-[#cc7a00] disabled:opacity-50"
                  >
                    {registrar.isPending ? "Registrando…" : "Registrar novedad"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
