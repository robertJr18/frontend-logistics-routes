import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "creada"
  | "lista-despacho"
  | "confirmada"
  | "en-transito"
  | "cerrada-manual"
  | "cerrada-automatica"
  | "cerrada-forzada"
  | "disponible"
  | "en-transito-vehicle"
  | "inactivo"
  | "en-mantenimiento"
  | "pendiente"
  | "exitosa"
  | "fallida"
  | "novedad"
  | "danger"
  | "warning";

const variantStyles: Record<BadgeVariant, string> = {
  creada: "bg-[#314595] text-white",
  "lista-despacho": "bg-[#ec9731] text-white",
  confirmada: "bg-[#4a6fa5] text-white",
  "en-transito": "bg-[#4caf82] text-white",
  "cerrada-manual": "bg-white/15 text-white",
  "cerrada-automatica": "bg-white/15 text-white",
  "cerrada-forzada": "bg-[#e05555] text-white",
  disponible: "bg-[#4caf82] text-white",
  "en-transito-vehicle": "bg-[#ec9731] text-white",
  inactivo: "bg-white/10 text-white/50",
  "en-mantenimiento": "bg-[#e05555] text-white",
  pendiente: "bg-white/20 text-white",
  exitosa: "bg-[#4caf82] text-white",
  fallida: "bg-[#e05555] text-white",
  novedad: "bg-[#cc7a00] text-white",
  danger: "bg-[#e05555] text-white",
  warning: "bg-[#ec9731] text-white",
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Helper to map route/vehicle status strings to badge variants
export function getRouteStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Creada: "creada",
    "Lista para Despacho": "lista-despacho",
    Confirmada: "confirmada",
    "En Tránsito": "en-transito",
    "Cerrada Manual": "cerrada-manual",
    "Cerrada Automática": "cerrada-automatica",
    "Cerrada Forzada": "cerrada-forzada",
  };
  return map[status] || "creada";
}

export function getVehicleStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Disponible: "disponible",
    "En Tránsito": "en-transito-vehicle",
    Inactivo: "inactivo",
    "En Mantenimiento": "en-mantenimiento",
  };
  return map[status] || "inactivo";
}

export function getStopStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Pendiente: "pendiente",
    Exitosa: "exitosa",
    Fallida: "fallida",
    Novedad: "novedad",
  };
  return map[status] || "pendiente";
}
