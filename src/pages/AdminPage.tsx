import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { vehiculos, conductores, type Vehiculo } from "@/data/mockData";
import {
  LayoutDashboard,
  Truck,
  Users,
  CalendarCheck,
  History,
  X,
  Plus,
  Edit,
  UserPlus,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Vehículos", icon: Truck, path: "/admin" },
  { label: "Conductores", icon: Users, path: "/admin/conductores" },
  { label: "Disponibilidad", icon: CalendarCheck, path: "/admin" },
  { label: "Historial", icon: History, path: "/admin/historial" },
];

function estadoVariant(estado: Vehiculo["estado"]) {
  switch (estado) {
    case "Disponible": return "success" as const;
    case "En Tránsito": return "warning" as const;
    case "Inactivo": return "neutral" as const;
  }
}

function tipoColor(tipo: Vehiculo["tipo"]) {
  switch (tipo) {
    case "Moto": return "bg-success/10 text-success border-success/20";
    case "Van": return "bg-primary/10 text-primary border-primary/20";
    case "NHR": return "bg-muted text-muted-foreground border-border";
    case "Turbo": return "bg-destructive/10 text-destructive border-destructive/20";
  }
}

export default function AdminPage() {
  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showAsignar, setShowAsignar] = useState<Vehiculo | null>(null);

  const total = vehiculos.length;
  const disponibles = vehiculos.filter((v) => v.estado === "Disponible").length;
  const enTransito = vehiculos.filter((v) => v.estado === "En Tránsito").length;
  const inactivos = vehiculos.filter((v) => v.estado === "Inactivo").length;

  const stats = [
    { label: "Total vehículos", value: total, color: "text-foreground" },
    { label: "Disponibles", value: disponibles, color: "text-success" },
    { label: "En Tránsito", value: enTransito, color: "text-primary" },
    { label: "Inactivos", value: inactivos, color: "text-muted-foreground" },
  ];

  return (
    <DashboardLayout title="Disponibilidad de la Flota" items={sidebarItems} alertCount={1}>
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Register button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowRegistrar(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Registrar Vehículo
        </button>
      </div>

      {/* Fleet table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Placa</th>
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Tipo</th>
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Conductor</th>
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Zona</th>
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Estado</th>
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Capacidad</th>
                <th className="px-4 py-3 text-xs text-muted-foreground font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.placa} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{v.placa}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded border ${tipoColor(v.tipo)}`}>
                      {v.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.conductor || <span className="text-primary text-xs">Sin asignar</span>}
                  </td>
                  <td className="px-4 py-3">{v.zona}</td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={estadoVariant(v.estado)}>{v.estado}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.round((v.pesoActual / v.capacidadPeso) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{v.pesoActual}/{v.capacidadPeso}kg</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Editar">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {v.estado === "Disponible" && !v.conductor && (
                        <button
                          onClick={() => setShowAsignar(v)}
                          className="p-1.5 hover:bg-muted rounded transition-colors text-primary"
                          title="Asignar conductor"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRegistrar && <RegistrarModal onClose={() => setShowRegistrar(false)} />}
      {showAsignar && <AsignarModal vehiculo={showAsignar} onClose={() => setShowAsignar(null)} />}
    </DashboardLayout>
  );
}

function RegistrarModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-popover border border-border rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">Registrar Vehículo</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Placa", placeholder: "XXX-000" },
            { label: "Modelo", placeholder: "Marca y modelo" },
            { label: "Capacidad de peso (kg)", placeholder: "500" },
            { label: "Volumen máximo (m³)", placeholder: "3.5" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground">{f.label}</label>
              <input className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary" placeholder={f.placeholder} />
            </div>
          ))}
          <div>
            <label className="text-xs text-muted-foreground">Tipo</label>
            <select className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Moto</option><option>Van</option><option>NHR</option><option>Turbo</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Zona de operación</label>
            <select className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Centro</option><option>Sur</option><option>Norte</option><option>Este</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-md font-medium text-sm mt-2 hover:bg-primary/90 transition-colors"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

function AsignarModal({ vehiculo, onClose }: { vehiculo: Vehiculo; onClose: () => void }) {
  const disponibles = conductores.filter((c) => c.disponible);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-popover border border-border rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Asignar Conductor</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{vehiculo.tipo} — {vehiculo.placa} ({vehiculo.zona})</p>
        <div>
          <label className="text-xs text-muted-foreground">Conductor</label>
          <select className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-primary">
            {disponibles.map((c) => (
              <option key={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-md font-medium text-sm mt-4 hover:bg-primary/90 transition-colors"
        >
          Confirmar Asignación
        </button>
      </div>
    </div>
  );
}
