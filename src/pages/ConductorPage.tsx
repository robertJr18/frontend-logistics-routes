import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { Check, X, AlertTriangle, Camera, ChevronDown } from "lucide-react";

type StopStatus = "Pendiente" | "Exitosa" | "Fallida" | "Novedad";

interface Stop {
  numero: number;
  paqueteId: string;
  direccion: string;
  destinatario: string;
  status: StopStatus;
  motivo?: string;
}

const initialStops: Stop[] = [
  { numero: 1, paqueteId: "PKG-006", direccion: "Cra 2 #14-30, Centro Histórico", destinatario: "Paola Rincón", status: "Exitosa" },
  { numero: 2, paqueteId: "PKG-007", direccion: "Calle 16 #4-55, Centro Histórico", destinatario: "Jorge Pedraza", status: "Exitosa" },
  { numero: 3, paqueteId: "PKG-008", direccion: "Cra 1 #20-12, Centro Histórico", destinatario: "Luz Díaz", status: "Fallida", motivo: "Cliente ausente" },
  { numero: 4, paqueteId: "PKG-009", direccion: "Calle 12 #5-40, Pescaito", destinatario: "Camilo Suárez", status: "Pendiente" },
  { numero: 5, paqueteId: "PKG-010", direccion: "Cra 5 #22-18, Pescaito", destinatario: "Ana Morales", status: "Pendiente" },
  { numero: 6, paqueteId: "PKG-011", direccion: "Av. del Río #8-45, Pescaito", destinatario: "Ricardo Vega", status: "Pendiente" },
  { numero: 7, paqueteId: "PKG-012", direccion: "Calle 10 #3-15, Pescaito", destinatario: "Sandra López", status: "Pendiente" },
];

export default function ConductorPage() {
  const navigate = useNavigate();
  const [enTransito, setEnTransito] = useState(false);
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [gestionando, setGestionando] = useState<Stop | null>(null);
  const [showCerrar, setShowCerrar] = useState(false);
  const [showCerrarWarning, setShowCerrarWarning] = useState(false);
  const [rutaCerrada, setRutaCerrada] = useState(false);

  const pendientes = stops.filter((s) => s.status === "Pendiente").length;
  const completadas = stops.filter((s) => s.status !== "Pendiente").length;
  const allDone = pendientes === 0;

  function updateStop(numero: number, status: StopStatus, motivo?: string) {
    setStops((prev) => prev.map((s) => s.numero === numero ? { ...s, status, motivo } : s));
    setGestionando(null);
  }

  function handleCerrarRuta() {
    if (pendientes > 0) {
      setShowCerrarWarning(true);
    } else {
      setShowCerrar(true);
    }
  }

  function cerrarRuta() {
    setRutaCerrada(true);
    setShowCerrar(false);
    setShowCerrarWarning(false);
  }

  if (rutaCerrada) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[480px] bg-card border-2 border-foreground p-6 text-center">
          <div className="h-14 w-14 border-2 border-foreground flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold mb-2 uppercase">Ruta Cerrada</h2>
          <p className="text-xs text-muted-foreground mb-4">
            El informe de cierre ha sido enviado al Sistema de Facturación y Liquidación.
          </p>
          <button onClick={() => navigate("/")} className="px-4 py-1.5 bg-foreground text-background text-xs font-bold uppercase">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-[480px] min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="h-12 border-b-2 border-foreground flex items-center justify-between px-4 bg-card">
          <span className="text-xs font-bold uppercase tracking-wide">Mi Ruta</span>
          <span className="text-xs text-muted-foreground">Carlos Martínez</span>
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-4 pb-24">
          {/* Route summary */}
          <div className="bg-card border-2 border-foreground p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs uppercase">RT-002</span>
              <StatusBadge variant={enTransito ? "orange" : "purple"}>
                {enTransito ? "En Tránsito" : "Ruta Confirmada"}
              </StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground">
              Zona Pescaito · 7 paradas · Vehículo: ABC-123 (Van)
            </p>
          </div>

          {/* State A — not yet in transit */}
          {!enTransito && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-foreground p-3 text-xs">
                Tu ruta está lista. Verifica que todos los paquetes están cargados antes de salir.
              </div>
              <button
                onClick={() => setEnTransito(true)}
                className="w-full py-2 bg-foreground text-background text-xs font-bold uppercase"
              >
                Confirmar Inicio de Tránsito
              </button>
            </div>
          )}

          {/* State B — in transit */}
          {enTransito && (
            <>
              {/* Progress */}
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{completadas}/{stops.length} paradas gestionadas</span>
                <span>{pendientes} pendientes</span>
              </div>

              {/* Stops */}
              {stops.map((stop) => (
                <div key={stop.numero} className="bg-card border-2 border-border p-3 flex items-start gap-3">
                  <span className={`shrink-0 h-7 w-7 flex items-center justify-center border-2 border-foreground text-xs font-bold`}>
                    {stop.status === "Exitosa" ? "✓" :
                     stop.status === "Fallida" ? "✗" :
                     stop.status === "Novedad" ? "!" :
                     stop.numero}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold">{stop.destinatario}</p>
                    <p className="text-xs text-muted-foreground truncate">{stop.direccion}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{stop.paqueteId}</span>
                      <StatusBadge variant={
                        stop.status === "Exitosa" ? "success" :
                        stop.status === "Fallida" ? "danger" :
                        stop.status === "Novedad" ? "warning" : "neutral"
                      }>{stop.status}</StatusBadge>
                    </div>
                    {stop.motivo && <p className="text-xs text-muted-foreground mt-1">→ {stop.motivo}</p>}
                  </div>
                  {stop.status === "Pendiente" && (
                    <button
                      onClick={() => setGestionando(stop)}
                      className="shrink-0 px-2 py-1 text-xs border-2 border-foreground font-bold uppercase"
                    >
                      Gestionar
                    </button>
                  )}
                </div>
              ))}

              {/* Close route button */}
              {allDone && (
                <button
                  onClick={handleCerrarRuta}
                  className="w-full py-2 bg-foreground text-background text-xs font-bold uppercase"
                >
                  Cerrar Ruta
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer for close route when not all done */}
        {enTransito && !allDone && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card border-t-2 border-foreground p-3">
            <button
              onClick={handleCerrarRuta}
              className="w-full py-2 border-2 border-foreground text-xs font-bold uppercase hover:bg-muted"
            >
              Cerrar Ruta
            </button>
          </div>
        )}

        {/* Gestionar modal */}
        {gestionando && (
          <GestionarModal stop={gestionando} onClose={() => setGestionando(null)} onResult={updateStop} />
        )}

        {/* Cerrar confirmation */}
        {showCerrar && (
          <BottomModal onClose={() => setShowCerrar(false)}>
            <p className="text-sm text-muted-foreground mb-4">
              ¿Cerrar ruta? Esta acción enviará el informe de cierre al Sistema de Facturación y Liquidación.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCerrar(false)} className="flex-1 py-2 border border-border rounded-lg text-sm">Cancelar</button>
              <button onClick={cerrarRuta} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Confirmar</button>
            </div>
          </BottomModal>
        )}

        {/* Warning modal */}
        {showCerrarWarning && (
          <BottomModal onClose={() => setShowCerrarWarning(false)}>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-accent flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Paradas pendientes
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                El sistema cerrará estas paradas automáticamente como <strong>sin_gestión_conductor</strong> si continúas.
              </p>
              <ul className="mt-2 space-y-1">
                {stops.filter((s) => s.status === "Pendiente").map((s) => (
                  <li key={s.numero} className="text-xs text-muted-foreground">• Parada {s.numero}: {s.direccion}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCerrarWarning(false)} className="flex-1 py-2 border border-border rounded-lg text-sm">Volver</button>
              <button onClick={cerrarRuta} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Cerrar de todas formas</button>
            </div>
          </BottomModal>
        )}
      </div>
    </div>
  );
}

function GestionarModal({ stop, onClose, onResult }: { stop: Stop; onClose: () => void; onResult: (n: number, s: StopStatus, m?: string) => void }) {
  const [step, setStep] = useState<"main" | "exitosa" | "fallida" | "novedad">("main");
  const [nombre, setNombre] = useState("");
  const [motivoFallo, setMotivoFallo] = useState("");
  const [tipoNovedad, setTipoNovedad] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-card border-t-2 border-foreground max-h-[80vh] overflow-auto">
        <div className="p-4 border-b-2 border-foreground">
          <p className="text-xs font-bold uppercase">Registrar Parada — {stop.direccion}</p>
          <p className="text-xs text-muted-foreground mt-1">{stop.paqueteId}</p>
        </div>

        <div className="p-4 space-y-3">
          {step === "main" && (
            <>
              <button onClick={() => setStep("exitosa")} className="w-full py-2 border-2 border-foreground text-xs font-bold uppercase flex items-center justify-center gap-2">
                ✓ Entrega Exitosa
              </button>
              <button onClick={() => setStep("fallida")} className="w-full py-2 border-2 border-foreground text-xs font-bold uppercase flex items-center justify-center gap-2">
                ✗ Parada Fallida
              </button>
              <button onClick={() => setStep("novedad")} className="w-full py-2 border-2 border-foreground text-xs font-bold uppercase flex items-center justify-center gap-2">
                ⚠ Novedad Grave
              </button>
            </>
          )}

          {step === "exitosa" && (
            <>
              <button className="w-full py-2 border-2 border-dashed border-foreground text-xs flex items-center justify-center gap-2">
                📷 Foto POD (obligatoria)
              </button>
              <div className="border-2 border-dashed border-foreground p-4 text-center text-xs text-muted-foreground h-20 flex items-center justify-center">
                [ Firma del receptor ]
              </div>
              <input
                type="text"
                placeholder="Nombre del receptor"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border-2 border-foreground px-2 py-1.5 text-xs bg-transparent"
              />
              <button onClick={() => onResult(stop.numero, "Exitosa")} className="w-full py-2 bg-foreground text-background text-xs font-bold uppercase">
                Confirmar Entrega
              </button>
            </>
          )}

          {step === "fallida" && (
            <>
              <p className="text-xs text-muted-foreground">Intento 1 de 2</p>
              <label className="text-xs text-muted-foreground">Motivo</label>
              <select value={motivoFallo} onChange={(e) => setMotivoFallo(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar motivo...</option>
                <option>Cliente ausente</option>
                <option>Dirección incorrecta</option>
                <option>Rechazado por cliente</option>
                <option>Zona de difícil acceso</option>
              </select>
              <button onClick={() => onResult(stop.numero, "Fallida", motivoFallo || "Sin especificar")} className="w-full py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium text-sm">
                Registrar Fallo
              </button>
            </>
          )}

          {step === "novedad" && (
            <>
              <label className="text-xs text-muted-foreground">Tipo de novedad</label>
              <select value={tipoNovedad} onChange={(e) => setTipoNovedad(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm">
                <option value="">Seleccionar tipo...</option>
                <option>Paquete dañado</option>
                <option>Extraviado</option>
                <option>Requiere devolución</option>
              </select>
              <button onClick={() => onResult(stop.numero, "Novedad", tipoNovedad || "Sin especificar")} className="w-full py-2.5 bg-[hsl(30,80%,40%)] text-white rounded-lg font-medium text-sm">
                Registrar Novedad
              </button>
            </>
          )}

          {step !== "main" && (
            <button onClick={() => setStep("main")} className="text-sm text-muted-foreground hover:text-foreground">← Volver</button>
          )}
        </div>
      </div>
    </div>
  );
}

function BottomModal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[480px] bg-card border-t border-border rounded-t-xl shadow-2xl p-5">
        {children}
      </div>
    </div>
  );
}
