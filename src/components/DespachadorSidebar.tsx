import { Bell, Clock, Route as RouteIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { derivarAlertas } from "@/lib/alertas";
import { useRutas } from "@/hooks/rutas/useRutas";

type ActivePage = "Rutas" | "Alertas" | "Historial";

interface DespachadorSidebarProps {
  activePage: ActivePage;
}

const ITEMS = [
  { label: "Rutas" as ActivePage, icon: RouteIcon, path: "/despachador" },
  { label: "Alertas" as ActivePage, icon: Bell, path: "/despachador/alertas" },
  { label: "Historial" as ActivePage, icon: Clock, path: "/despachador/historial" },
];

export default function DespachadorSidebar({ activePage }: DespachadorSidebarProps) {
  const navigate = useNavigate();
  const { data: rutas = [] } = useRutas();
  const alertasUrgentes = derivarAlertas(rutas).filter((a) => a.tipo === "urgente").length;

  return (
    <aside className="w-60 border-r border-white/10 p-4 flex flex-col gap-1">
      {ITEMS.map((item) => (
        <button
          key={item.label}
          onClick={() => navigate(item.path)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left ${
            item.label === activePage
              ? "bg-card text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
          {item.label === "Alertas" && alertasUrgentes > 0 && (
            <span className="ml-auto bg-destructive text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {alertasUrgentes}
            </span>
          )}
        </button>
      ))}
    </aside>
  );
}
