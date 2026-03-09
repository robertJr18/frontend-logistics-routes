import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import {
  vehiculos as initialVehiculos,
  conductores as initialConductores,
  historialAsignaciones,
  zonasSantaMarta,
  type Vehiculo,
  type Conductor,
} from "@/data/mockData";
import { X, Plus, Edit, XCircle, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [tab, setTab] = useState<"vehiculos" | "conductores">("vehiculos");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar roleName="Administrador de Flota" />
      <div className="border-b-2 border-foreground bg-card">
        <div className="flex gap-0 px-6">
          {(["vehiculos", "conductores"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border-b-2 ${
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "vehiculos" ? "Vehículos" : "Conductores"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        {tab === "vehiculos" ? <VehiculosTab /> : <ConductoresTab />}
      </div>
    </div>
  );
}

// ===================== VEHICULOS TAB =====================

function VehiculosTab() {
  const { toast } = useToast();
  const [vehiculos, setVehiculos] = useState(initialVehiculos);
  const [showRegistrar, setShowRegistrar] = useState(false);

  function tipoColor(tipo: string) {
    switch (tipo) {
      case "Moto": return "bg-success/10 text-success";
      case "Van": return "bg-primary/10 text-primary";
      case "NHR": return "bg-muted text-muted-foreground";
      case "Turbo": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  }

  function handleRegistrar(v: Vehiculo) {
    if (vehiculos.some((ex) => ex.placa === v.placa)) {
      return "Esta placa ya está registrada";
    }
    if (v.capacidadPeso <= 0 || v.volumenMax <= 0) {
      return "La capacidad debe ser mayor a cero";
    }
    setVehiculos((prev) => [...prev, v]);
    setShowRegistrar(false);
    toast({ title: "Vehículo registrado", description: `${v.placa} agregado exitosamente.` });
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide">Vehículos</h2>
        <button onClick={() => setShowRegistrar(true)} className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-xs font-bold uppercase">
          <Plus className="h-3 w-3" /> Registrar Vehículo
        </button>
      </div>

      <div className="bg-card border-2 border-foreground overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Placa", "Tipo", "Capacidad (kg)", "Volumen (m³)", "Zona", "Estado", "Conductor Asignado", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => {
                const isTransit = v.estado === "En Tránsito";
                const sinConductor = v.estado === "Disponible" && !v.conductorAsignado;
                return (
                  <tr key={v.placa} className="border-b border-border last:border-0 hover:bg-muted">
                    <td className="px-4 py-2 font-bold text-xs">{v.placa}</td>
                    <td className="px-4 py-2">
                      <span className="text-xs font-bold border border-foreground px-1.5 py-0.5">{v.tipo}</span>
                    </td>
                    <td className="px-4 py-3">{v.capacidadPeso}</td>
                    <td className="px-4 py-3">{v.volumenMax}</td>
                    <td className="px-4 py-3">{v.zona}</td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={v.estado === "Disponible" ? "success" : v.estado === "En Tránsito" ? "orange" : "neutral"}>
                        {v.estado}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      {v.conductorAsignado || (
                        <span className="relative group">
                          <StatusBadge variant="warning">Sin conductor</StatusBadge>
                          <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                            No disponible para planificación hasta asignar conductor
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span className="relative group">
                          <button disabled={isTransit} className={`p-1.5 rounded transition-colors ${isTransit ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"}`}>
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          {isTransit && (
                            <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              Vehículo con ruta activa en curso
                            </span>
                          )}
                        </span>
                        <span className="relative group">
                          <button disabled={isTransit} className={`p-1.5 rounded transition-colors ${isTransit ? "opacity-30 cursor-not-allowed" : "hover:bg-muted text-destructive"}`}>
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                          {isTransit && (
                            <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              Vehículo con ruta activa en curso
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showRegistrar && <RegistrarVehiculoModal onClose={() => setShowRegistrar(false)} onRegistrar={handleRegistrar} />}
    </>
  );
}

function RegistrarVehiculoModal({ onClose, onRegistrar }: { onClose: () => void; onRegistrar: (v: Vehiculo) => string | null }) {
  const [placa, setPlaca] = useState("");
  const [tipo, setTipo] = useState<Vehiculo["tipo"]>("Van");
  const [modelo, setModelo] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [volumen, setVolumen] = useState("");
  const [zona, setZona] = useState(zonasSantaMarta[0]);
  const [error, setError] = useState("");

  function handleSubmit() {
    const cap = Number(capacidad);
    const vol = Number(volumen);
    if (cap <= 0 || vol <= 0) {
      setError("La capacidad debe ser mayor a cero");
      return;
    }
    const err = onRegistrar({
      placa, tipo, modelo, capacidadPeso: cap, volumenMax: vol, zona, estado: "Disponible", conductorAsignado: null,
    });
    if (err) setError(err);
  }

  return (
    <Modal title="Registrar Vehículo" onClose={onClose}>
      <div className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        <Field label="Placa" value={placa} onChange={setPlaca} placeholder="XYZ-789" />
        <div>
          <label className="text-xs text-muted-foreground">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as any)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mt-1">
            <option>Moto</option><option>Van</option><option>NHR</option><option>Turbo</option>
          </select>
        </div>
        <Field label="Modelo" value={modelo} onChange={setModelo} placeholder="Marca y modelo" />
        <Field label="Capacidad de Peso (kg)" value={capacidad} onChange={setCapacidad} placeholder="500" type="number" />
        <Field label="Volumen Máximo (m³)" value={volumen} onChange={setVolumen} placeholder="3.5" type="number" />
        <div>
          <label className="text-xs text-muted-foreground">Zona de Operación</label>
          <select value={zona} onChange={(e) => setZona(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mt-1">
            {zonasSantaMarta.map((z) => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-1.5 border-2 border-foreground text-xs font-bold uppercase hover:bg-muted">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-1.5 bg-foreground text-background text-xs font-bold uppercase">Registrar</button>
        </div>
      </div>
    </Modal>
  );
}

// ===================== CONDUCTORES TAB =====================

function ConductoresTab() {
  const { toast } = useToast();
  const [conductores, setConductores] = useState(initialConductores);
  const [vehiculos, setVehiculos] = useState(initialVehiculos);
  const [showAsignar, setShowAsignar] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);

  const driversWithout = conductores.filter((c) => c.estado === "Activo" && !c.vehiculoAsignado);
  const vehiclesWithout = vehiculos.filter((v) => v.estado === "Disponible" && !v.conductorAsignado);

  function handleAsignar(driverId: string, vehiclePlaca: string) {
    setConductores((prev) => prev.map((c) => c.id === driverId ? { ...c, vehiculoAsignado: vehiclePlaca } : c));
    setVehiculos((prev) => prev.map((v) => v.placa === vehiclePlaca ? { ...v, conductorAsignado: conductores.find((c) => c.id === driverId)!.nombre } : v));
    setShowAsignar(false);
    toast({ title: "Asignación exitosa", description: `Conductor asignado a ${vehiclePlaca}.` });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide">Conductores</h2>
        <button onClick={() => setShowAsignar(true)} className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-xs font-bold uppercase">
          Asignar Conductor
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Nombre", "Estado", "Vehículo Asignado", "Turno Activo", "Acciones"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conductores.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-[hsl(var(--hover-row))] transition-colors">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={c.estado === "Activo" ? "success" : "neutral"}>{c.estado}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">{c.vehiculoAsignado || <span className="text-muted-foreground">Sin asignar</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.turnoActivo || "—"}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-muted rounded transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <button onClick={() => setHistorialOpen(!historialOpen)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
          <span>Historial de Asignaciones</span>
          {historialOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {historialOpen && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-border text-left">
                {["Conductor", "Vehículo", "Fecha inicio", "Fecha fin"].map((h) => (
                  <th key={h} className="px-4 py-2 text-xs text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historialAsignaciones.map((h, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-[hsl(var(--hover-row))] transition-colors">
                  <td className="px-4 py-2">{h.conductor}</td>
                  <td className="px-4 py-2">{h.vehiculo}</td>
                  <td className="px-4 py-2 text-muted-foreground">{h.fechaInicio}</td>
                  <td className="px-4 py-2 text-muted-foreground">{h.fechaFin || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAsignar && (
        <AsignarModal
          drivers={driversWithout}
          vehicles={vehiclesWithout}
          onClose={() => setShowAsignar(false)}
          onAsignar={handleAsignar}
        />
      )}
    </>
  );
}

function AsignarModal({ drivers, vehicles, onClose, onAsignar }: { drivers: Conductor[]; vehicles: Vehiculo[]; onClose: () => void; onAsignar: (d: string, v: string) => void }) {
  const [driverId, setDriverId] = useState("");
  const [vehiclePlaca, setVehiclePlaca] = useState("");

  return (
    <Modal title="Asignar Conductor a Vehículo" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground">Conductor</label>
          <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mt-1">
            <option value="">Seleccionar conductor...</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Vehículo</label>
          <select value={vehiclePlaca} onChange={(e) => setVehiclePlaca(e.target.value)} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mt-1">
            <option value="">Seleccionar vehículo...</option>
            {vehicles.map((v) => <option key={v.placa} value={v.placa}>{v.placa} — {v.tipo} ({v.zona})</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">Solo se muestran conductores sin vehículo y vehículos disponibles sin conductor.</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={() => driverId && vehiclePlaca && onAsignar(driverId, vehiclePlaca)} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Confirmar Asignación</button>
        </div>
      </div>
    </Modal>
  );
}

// ===================== SHARED =====================

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

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm mt-1" />
    </div>
  );
}
