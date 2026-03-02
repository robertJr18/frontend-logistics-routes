import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { rutas } from "@/data/mockData";
import type { Parada } from "@/data/mockData";
import {
  Route,
  Map,
  LogOut,
  Check,
  X,
  AlertTriangle,
  Camera,
  ChevronLeft,
} from "lucide-react";

const ruta = rutas[0]; // Demo with first route

type Tab = "ruta" | "mapa" | "cerrar";

export default function ConductorPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("ruta");
  const [paradas, setParadas] = useState<Parada[]>(ruta.paradas);
  const [gestionando, setGestionando] = useState<Parada | null>(null);
  const [showCerrar, setShowCerrar] = useState(false);

  const completadas = paradas.filter((p) => p.completada).length;
  const pendientes = paradas.length - completadas;
  const pct = Math.round((completadas / paradas.length) * 100);

  function marcarResultado(numero: number, resultado: "exitosa" | "fallida" | "novedad", motivo?: string) {
    setParadas((prev) =>
      prev.map((p) =>
        p.numero === numero ? { ...p, completada: true, resultado, motivoFallo: motivo } : p
      )
    );
    setGestionando(null);
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col border-x border-border relative">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <button onClick={() => navigate("/")} className="p-1">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold tracking-tight">
            Logistics<span className="text-primary">Routes</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Juan Pérez</span>
            <StatusBadge variant="warning">En Ruta</StatusBadge>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-20 p-4 space-y-4">
          {tab === "ruta" && !showCerrar && (
            <>
              {/* Route header card */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Ruta</span>
                    <p className="font-semibold">{ruta.id}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Vehículo</span>
                    <p>{ruta.vehiculoTipo} {ruta.vehiculoPlaca}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">Paradas</span>
                    <p>{paradas.length} total | {completadas} completadas | {pendientes} pendientes</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{pct}% completado</p>
              </div>

              {/* Stop list */}
              {paradas.map((parada) => (
                <div
                  key={parada.numero}
                  className="bg-card border border-border rounded-lg p-4 flex items-start gap-3"
                >
                  <span
                    className={`shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-xs font-bold ${
                      parada.completada
                        ? parada.resultado === "exitosa"
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {parada.completada ? (
                      parada.resultado === "exitosa" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
                    ) : (
                      parada.numero
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{parada.paquete.direccion}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-xs text-muted-foreground">{parada.paquete.id}</span>
                      <StatusBadge
                        variant={parada.paquete.tipoPaquete === "Frágil" ? "warning" : "neutral"}
                      >
                        {parada.paquete.tipoPaquete}
                      </StatusBadge>
                      <span className="text-xs text-muted-foreground">{parada.paquete.metodoPago}</span>
                    </div>
                    {parada.completada && parada.motivoFallo && (
                      <p className="text-xs text-destructive mt-1">{parada.motivoFallo}</p>
                    )}
                  </div>
                  {!parada.completada && (
                    <button
                      onClick={() => setGestionando(parada)}
                      className="shrink-0 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md font-medium"
                    >
                      Gestionar
                    </button>
                  )}
                </div>
              ))}
            </>
          )}

          {tab === "mapa" && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Map className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">Mapa de ruta no disponible en demo</p>
            </div>
          )}

          {showCerrar && <CerrarRutaView pendientes={pendientes} onVolver={() => setShowCerrar(false)} onCerrar={() => navigate("/")} />}
        </div>

        {/* Bottom bar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-popover border-t border-border flex">
          {[
            { id: "ruta" as Tab, icon: Route, label: "Mi Ruta" },
            { id: "mapa" as Tab, icon: Map, label: "Mapa" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setShowCerrar(false); }}
              className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                tab === item.id && !showCerrar ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 mb-0.5" />
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setShowCerrar(true)}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
              showCerrar ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <LogOut className="h-5 w-5 mb-0.5" />
            Cerrar Ruta
          </button>
        </nav>

        {/* Gestionar modal */}
        {gestionando && (
          <GestionarModal
            parada={gestionando}
            onClose={() => setGestionando(null)}
            onResult={marcarResultado}
          />
        )}
      </div>
    </div>
  );
}

function GestionarModal({
  parada,
  onClose,
  onResult,
}: {
  parada: Parada;
  onClose: () => void;
  onResult: (n: number, r: "exitosa" | "fallida" | "novedad", m?: string) => void;
}) {
  const [step, setStep] = useState<"main" | "exitosa" | "fallida" | "novedad">("main");
  const [nombre, setNombre] = useState("");

  const motivosFallo = ["Cliente ausente", "Dirección incorrecta", "Rechazado", "Zona difícil acceso"];
  const motivosNovedad = ["Dañado", "Extraviado", "Devolución"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-popover border border-border rounded-t-xl sm:rounded-xl shadow-2xl max-h-[85vh] overflow-auto">
        <div className="p-5 border-b border-border">
          <p className="text-xs text-muted-foreground">Parada {parada.numero}</p>
          <p className="font-medium text-sm mt-1">{parada.paquete.direccion}</p>
          <p className="text-xs text-muted-foreground mt-1">{parada.paquete.id} · {parada.paquete.tipoPaquete} · {parada.paquete.peso} kg</p>
        </div>

        <div className="p-5 space-y-3">
          {step === "main" && (
            <>
              <button
                onClick={() => setStep("exitosa")}
                className="w-full py-3 bg-success/15 text-success border border-success/30 rounded-lg font-medium text-sm hover:bg-success/25 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" /> Entrega Exitosa
              </button>
              <button
                onClick={() => setStep("fallida")}
                className="w-full py-3 bg-destructive/15 text-destructive border border-destructive/30 rounded-lg font-medium text-sm hover:bg-destructive/25 transition-colors flex items-center justify-center gap-2"
              >
                <X className="h-5 w-5" /> Entrega Fallida
              </button>
              <button
                onClick={() => setStep("novedad")}
                className="w-full py-3 bg-primary/15 text-primary border border-primary/30 rounded-lg font-medium text-sm hover:bg-primary/25 transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle className="h-5 w-5" /> Novedad Grave
              </button>
            </>
          )}

          {step === "exitosa" && (
            <>
              <button className="w-full py-3 border border-border rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors">
                <Camera className="h-5 w-5" /> Tomar foto POD
              </button>
              <div className="border border-border rounded-lg p-4 text-center text-sm text-muted-foreground h-24 flex items-center justify-center">
                Área de firma del receptor
              </div>
              <input
                type="text"
                placeholder="Nombre del receptor"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => onResult(parada.numero, "exitosa")}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Confirmar
              </button>
            </>
          )}

          {step === "fallida" && (
            <div className="space-y-2">
              {motivosFallo.map((m) => (
                <button
                  key={m}
                  onClick={() => onResult(parada.numero, "fallida", m)}
                  className="w-full py-2.5 text-left px-4 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {step === "novedad" && (
            <div className="space-y-2">
              {motivosNovedad.map((m) => (
                <button
                  key={m}
                  onClick={() => onResult(parada.numero, "novedad", m)}
                  className="w-full py-2.5 text-left px-4 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {step !== "main" && (
          <div className="px-5 pb-5">
            <button onClick={() => setStep("main")} className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CerrarRutaView({ pendientes, onVolver, onCerrar }: { pendientes: number; onVolver: () => void; onCerrar: () => void }) {
  return (
    <div className="space-y-4 py-4">
      {pendientes > 0 ? (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" /> Paradas pendientes
          </p>
          <p className="text-sm text-muted-foreground">
            Tienes {pendientes} paradas sin gestionar. Si cierras ahora, el sistema las marcará como novedad automática.
          </p>
        </div>
      ) : (
        <div className="bg-success/10 border border-success/30 rounded-lg p-4">
          <p className="text-sm">Todas las paradas han sido gestionadas. Puedes cerrar la ruta.</p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={onVolver}
          className="flex-1 py-2.5 border border-border rounded-md text-sm hover:bg-muted transition-colors"
        >
          Volver y gestionar
        </button>
        <button
          onClick={onCerrar}
          className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Cerrar de todas formas
        </button>
      </div>
    </div>
  );
}
