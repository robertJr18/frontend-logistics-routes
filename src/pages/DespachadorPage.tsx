import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { rutas as initialRutas, vehiculos, conductores, type Ruta, type RouteStatus } from "@/data/mockData";
import { X, AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function statusVariant(s: RouteStatus) {
  switch (s) {
    case "En Espera": return "neutral" as const;
    case "Lista para Despacho": return "info" as const;
    case "Ruta Confirmada": return "purple" as const;
    case "En Tránsito": return "orange" as const;
    case "Cerrada": return "success" as const;
  }
}

export default function DespachadorPage() {
  const { toast } = useToast();
  const [rutas, setRutas] = useState(initialRutas);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(true);
  const [showExcluir, setShowExcluir] = useState(false);
  const [showForzar, setShowForzar] = useState(false);
  const [vehiculoSel, setVehiculoSel] = useState("");
  const [conductorSel, setConductorSel] = useState("");

  const selected = rutas.find((r) => r.id === selectedId) || null;

  const totalPeso = (r: Ruta) => r.paquetes.reduce((s, p) => s + p.peso, 0);

  function confirmarDespacho(id: string) {
    if (!vehiculoSel || !conductorSel) {
      toast({ title: "Error", description: "Selecciona vehículo y conductor antes de confirmar.", variant: "destructive" });
      return;
    }
    setRutas((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, estado: "Ruta Confirmada" as RouteStatus, vehiculoAsignado: vehiculoSel, conductorAsignado: conductorSel } : r
      )
    );
    toast({ title: "Ruta confirmada", description: "El conductor recibirá la ruta en su dispositivo." });
    setVehiculoSel("");
    setConductorSel("");
  }

  function forzarCierre(id: string) {
    setRutas((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              estado: "Cerrada" as RouteStatus,
              paradas: r.paradas.map((p) => (p.status === "Pendiente" ? { ...p, status: "Novedad" as const, tipoNovedad: "sin_gestión_conductor" } : p)),
              resumen: {
                total: r.paradas.length,
                exitosas: r.paradas.filter((p) => p.status === "Exitosa").length,
                fallidas: r.paradas.filter((p) => p.status === "Fallida").length,
                novedades: r.paradas.filter((p) => p.status === "Novedad" || p.status === "Pendiente").length,
              },
            }
          : r
      )
    );
    setShowForzar(false);
    toast({ title: "Ruta cerrada", description: "Las paradas pendientes fueron marcadas como sin_gestión_conductor." });
  }

  function isExpiringSoon(fecha: string) {
    const diff = new Date(fecha).getTime() - new Date("2026-03-07").getTime();
    return diff <= 86400000 && diff >= 0;
  }

  const availableVehicles = vehiculos.filter(
    (v) => v.estado === "Disponible" && selected && v.tipo === selected.vehiculoRequerido
  );
  const availableDrivers = conductores.filter((c) => c.estado === "Activo");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar roleName="Despachador Logístico" />

      {/* Alert banner */}
      {alertVisible && (
        <div className="mx-6 mt-4 flex items-center justify-between bg-accent text-accent-foreground rounded-lg px-4 py-3 text-sm font-medium">
          <span>⚠ RT-003 · Zona Rodadero: paquete PKG-041 vence en menos de 24 horas. Despacho urgente requerido.</span>
          <button onClick={() => setAlertVisible(false)} className="p-1 hover:bg-white/20 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex-1 flex p-6 gap-6 overflow-hidden">
        {/* LEFT — Route list */}
        <div className="w-[35%] shrink-0 flex flex-col gap-3 overflow-auto">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold">Rutas</h2>
            <StatusBadge variant="info">{rutas.length}</StatusBadge>
          </div>

          {rutas.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setVehiculoSel(""); setConductorSel(""); }}
              className={`w-full text-left bg-card border rounded-lg p-4 transition-all hover:shadow-md ${
                selectedId === r.id ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{r.id}</span>
                <StatusBadge variant={statusVariant(r.estado)}>{r.estado}</StatusBadge>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>Zona: {r.zona}</span>
                <span>{r.paquetes.length} paquetes</span>
                <span>{totalPeso(r)} kg</span>
                <span>Requiere: {r.vehiculoRequerido}</span>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT — Detail */}
        <div className="flex-1 overflow-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">Selecciona una ruta para ver su detalle</p>
            </div>
          ) : selected.estado === "Lista para Despacho" ? (
            <ListaParaDespachoDetail
              ruta={selected}
              availableVehicles={availableVehicles}
              availableDrivers={availableDrivers}
              vehiculoSel={vehiculoSel}
              conductorSel={conductorSel}
              onVehiculoChange={setVehiculoSel}
              onConductorChange={setConductorSel}
              onConfirmar={() => confirmarDespacho(selected.id)}
              onExcluir={() => setShowExcluir(true)}
              isExpiringSoon={isExpiringSoon}
            />
          ) : selected.estado === "En Tránsito" ? (
            <EnTransitoDetail ruta={selected} onForzarCierre={() => setShowForzar(true)} />
          ) : selected.estado === "Cerrada" ? (
            <CerradaDetail ruta={selected} />
          ) : selected.estado === "Ruta Confirmada" ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selected.id} — {selected.zona}</h2>
                <StatusBadge variant="purple">Ruta Confirmada</StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">Vehículo: {selected.vehiculoAsignado} · Conductor: {selected.conductorAsignado}</p>
              <p className="text-sm text-muted-foreground mt-2">La ruta ha sido confirmada y está pendiente de inicio por el conductor.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selected.id} — {selected.zona}</h2>
                <StatusBadge variant="neutral">{selected.estado}</StatusBadge>
              </div>
              <p className="text-sm text-muted-foreground">Esta ruta está en espera de planificación.</p>
            </div>
          )}
        </div>
      </div>

      {/* Excluir modal */}
      {showExcluir && selected && (
        <Modal title="Excluir Paquete" onClose={() => setShowExcluir(false)}>
          <div className="space-y-3">
            <label className="text-xs text-muted-foreground">Paquete a excluir</label>
            <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm">
              {selected.paquetes.map((p) => (
                <option key={p.id}>{p.id} — {p.direccion}</option>
              ))}
            </select>
            <label className="text-xs text-muted-foreground">Motivo de exclusión</label>
            <textarea className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="Describa el motivo..." />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowExcluir(false)} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={() => setShowExcluir(false)} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Excluir</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Forzar cierre modal */}
      {showForzar && selected && (
        <Modal title="Confirmar Cierre Forzado" onClose={() => setShowForzar(false)}>
          <p className="text-sm text-muted-foreground mb-4">
            ¿Confirmar cierre forzado? Las paradas pendientes quedarán marcadas como <strong>sin_gestión_conductor</strong>.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowForzar(false)} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button onClick={() => forzarCierre(selected.id)} className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium">Confirmar Cierre</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// === Sub-components ===

function ListaParaDespachoDetail({
  ruta, availableVehicles, availableDrivers, vehiculoSel, conductorSel,
  onVehiculoChange, onConductorChange, onConfirmar, onExcluir, isExpiringSoon,
}: any) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{ruta.id} — {ruta.zona}</h2>
          <StatusBadge variant="info">Lista para Despacho</StatusBadge>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <span>Creada: {ruta.fechaCreacion}</span>
          <span>Límite despacho: {ruta.fechaLimiteDespacho}</span>
        </div>
      </div>

      {/* Package table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Paquete</th>
              <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Peso (kg)</th>
              <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Dirección destino</th>
              <th className="px-5 py-3 text-xs text-muted-foreground font-medium">Fecha límite</th>
            </tr>
          </thead>
          <tbody>
            {ruta.paquetes.map((p: any) => {
              const expiring = isExpiringSoon(p.fechaLimiteEntrega);
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-[hsl(var(--hover-row))] transition-colors">
                  <td className="px-5 py-3 font-medium">{p.id}</td>
                  <td className="px-5 py-3">{p.peso}</td>
                  <td className="px-5 py-3">{p.direccion}</td>
                  <td className="px-5 py-3">
                    <span className={expiring ? "text-accent font-semibold flex items-center gap-1" : ""}>
                      {expiring && <AlertTriangle className="h-3.5 w-3.5" />}
                      {p.fechaLimiteEntrega}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vehicle & driver selection */}
      <div className="p-5 border-t border-border space-y-4">
        <p className="text-sm font-medium">Tipo requerido: <span className="text-primary font-semibold">{ruta.vehiculoRequerido}</span></p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Vehículo físico</label>
            <select
              value={vehiculoSel}
              onChange={(e) => onVehiculoChange(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mt-1"
            >
              <option value="">Seleccionar...</option>
              {availableVehicles.map((v: any) => (
                <option key={v.placa} value={v.placa}>{v.placa} — {v.modelo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Conductor</label>
            <select
              value={conductorSel}
              onChange={(e) => onConductorChange(e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mt-1"
            >
              <option value="">Seleccionar...</option>
              {availableDrivers.map((c: any) => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onExcluir} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
            Excluir paquete
          </button>
          <button onClick={onConfirmar} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Confirmar Despacho
          </button>
        </div>
      </div>
    </div>
  );
}

function EnTransitoDetail({ ruta, onForzarCierre }: { ruta: Ruta; onForzarCierre: () => void }) {
  function stopVariant(s: string) {
    switch (s) {
      case "Exitosa": return "success" as const;
      case "Fallida": return "danger" as const;
      case "Novedad": return "warning" as const;
      default: return "neutral" as const;
    }
  }
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{ruta.id} — {ruta.zona}</h2>
          <StatusBadge variant="orange">En Tránsito</StatusBadge>
        </div>
        <p className="text-xs text-muted-foreground">Vehículo: {ruta.vehiculoAsignado} · Conductor: {ruta.conductorAsignado}</p>
      </div>
      <div className="divide-y divide-border">
        {ruta.paradas.map((p) => (
          <div key={p.numero} className="px-5 py-3 flex items-center gap-3 hover:bg-[hsl(var(--hover-row))] transition-colors">
            <span className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{p.numero}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.direccion}</p>
              <p className="text-xs text-muted-foreground">{p.paqueteId}</p>
            </div>
            <StatusBadge variant={stopVariant(p.status)}>{p.status}</StatusBadge>
          </div>
        ))}
      </div>
      <div className="p-5 border-t border-border">
        <button onClick={onForzarCierre} className="px-4 py-2 border border-destructive text-destructive rounded-lg text-sm hover:bg-destructive/10 transition-colors">
          Forzar Cierre de Ruta
        </button>
      </div>
    </div>
  );
}

function CerradaDetail({ ruta }: { ruta: Ruta }) {
  const r = ruta.resumen;
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{ruta.id} — {ruta.zona}</h2>
        <StatusBadge variant="success">Cerrada</StatusBadge>
      </div>
      {r && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[
            { label: "Total paradas", value: r.total },
            { label: "Exitosas", value: r.exitosas, color: "text-success" },
            { label: "Fallidas", value: r.fallidas, color: "text-destructive" },
            { label: "Novedades", value: r.novedades, color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${(s as any).color || ""}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="divide-y divide-border">
        {ruta.paradas.map((p) => (
          <div key={p.numero} className="py-2 flex items-center gap-3 text-sm">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{p.numero}</span>
            <span className="flex-1 truncate">{p.direccion}</span>
            <StatusBadge variant={p.status === "Exitosa" ? "success" : p.status === "Fallida" ? "danger" : "warning"}>{p.status}</StatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
