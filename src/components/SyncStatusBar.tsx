import { WifiOff, RefreshCw, Upload } from "lucide-react";
import { useSyncStatus } from "@/hooks/conductor/useSyncStatus";
import { cn } from "@/lib/utils";

export function SyncStatusBar() {
  const { isOnline, pendingCount, syncing } = useSyncStatus();

  if (isOnline && pendingCount === 0 && !syncing) return null;

  const label = !isOnline
    ? pendingCount > 0
      ? `Sin conexión · ${pendingCount} ${pendingCount === 1 ? "acción pendiente" : "acciones pendientes"}`
      : "Sin conexión"
    : syncing
      ? "Sincronizando con el servidor…"
      : `Subiendo ${pendingCount} ${pendingCount === 1 ? "acción" : "acciones"}…`;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-xs font-medium w-full",
        !isOnline && "bg-[#e05555]/20 text-[#ff8a80]",
        isOnline && syncing && "bg-primary/20 text-primary",
        isOnline && !syncing && pendingCount > 0 && "bg-[#ec9731]/20 text-[#ec9731]",
      )}
    >
      {!isOnline && <WifiOff className="w-3 h-3 flex-shrink-0" />}
      {isOnline && syncing && <RefreshCw className="w-3 h-3 flex-shrink-0 animate-spin" />}
      {isOnline && !syncing && pendingCount > 0 && <Upload className="w-3 h-3 flex-shrink-0" />}
      {label}
    </div>
  );
}
