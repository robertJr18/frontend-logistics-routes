import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Users, Link as LinkIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatusBadge, { getVehicleStatusVariant } from "@/components/StatusBadge";
import { vehiculos, conductores } from "@/data/mockData";

const sidebarItems = [
  { label: "Flota", icon: Truck },
  { label: "Conductores", icon: Users },
  { label: "Asignaciones", icon: LinkIcon },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"flota" | "conductores">("flota");
  const disponibles = vehiculos.filter(v => v.estado === "Disponible").length;
  const enTransito = vehiculos.filter(v => v.estado === "En Tránsito").length;
  const inactivos = vehiculos.filter(v => v.estado === "Inactivo" || v.estado === "En Mantenimiento").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Administrador de Flota" />
      <div className="flex flex-1">
        <aside className="w-60 border-r border-white/10 p-4 flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "Asignaciones") navigate("/admin/asignaciones");
                else if (item.label === "Flota") setActiveTab("flota");
                else if (item.label === "Conductores") setActiveTab("conductores");
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left ${
                (item.label === "Flota" && activeTab === "flota") || (item.label === "Conductores" && activeTab === "conductores")
                  ? "bg-card text-white" : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "flota" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Flota de Vehículos</h1>
                <button onClick={() => navigate("/admin/registrar")} className="btn-primary">Registrar vehículo</button>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total vehículos", value: vehiculos.length, color: "text-white" },
                  { label: "Disponibles", value: disponibles, color: "text-[#4caf82]" },
                  { label: "En tránsito", value: enTransito, color: "text-primary" },
                  { label: "Inactivos / Mant.", value: inactivos, color: "text-[#e05555]" },
                ].map(card => (
                  <div key={card.label} className="card-navy p-4 text-center">
                    <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-white/60 text-sm">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="card-navy overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Placa","Tipo","Modelo","Capacidad","Zona Operación","Conductor Asignado","Estado","Acciones"].map(col=>(
                        <th key={col} className="text-left text-xs font-semibold text-white/60 px-4 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculos.map(v => {
                      const isTransit = v.estado === "En Tránsito";
                      return (
                        <tr key={v.placa} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-sm font-semibold text-white">{v.placa}</td>
                          <td className="px-4 py-3 text-sm text-white">{v.tipo}</td>
                          <td className="px-4 py-3 text-sm text-white">{v.modelo}</td>
                          <td className="px-4 py-3 text-sm text-white">{v.capacidadPeso.toLocaleString()} kg</td>
                          <td className="px-4 py-3 text-sm text-white">{v.zona}</td>
                          <td className="px-4 py-3 text-sm text-white">{v.conductorAsignado || "—"}</td>
                          <td className="px-4 py-3"><StatusBadge variant={getVehicleStatusVariant(v.estado)}>{v.estado}</StatusBadge></td>
                          <td className="px-4 py-3 flex gap-2">
                            <button disabled={isTransit} className={`text-xs font-medium ${isTransit?"text-white/20 cursor-not-allowed":"text-primary hover:underline"}`}>Ver detalle</button>
                            <button disabled={isTransit} className={`text-xs font-medium ${isTransit?"text-white/20 cursor-not-allowed":"text-primary hover:underline"}`}>Editar</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {activeTab === "conductores" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Conductores</h1>
              </div>
              <div className="card-navy overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["Nombre","Estado","Vehículo Asignado","Turno Activo"].map(col=>(
                        <th key={col} className="text-left text-xs font-semibold text-white/60 px-4 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {conductores.map(c=>(
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-sm font-semibold text-white">{c.nombre}</td>
                        <td className="px-4 py-3"><StatusBadge variant={c.estado==="Activo"?"disponible":"inactivo"}>{c.estado}</StatusBadge></td>
                        <td className="px-4 py-3 text-sm text-white">{c.vehiculoAsignado||"Sin asignar"}</td>
                        <td className="px-4 py-3 text-sm text-white">{c.turnoActivo||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
