import type { Ruta } from "@/types/domain";

export interface Alerta {
  id: string;
  tipo: "urgente" | "info";
  titulo: string;
  descripcion: string;
  fecha: string;
  rutaId: string;
  accion: "Despachar ahora" | null;
}

const HORA_MS = 60 * 60 * 1000;

export function derivarAlertas(rutas: Ruta[], now: Date = new Date()): Alerta[] {
  const alertas: Alerta[] = [];

  for (const r of rutas) {
    if (r.estado === "Creada") {
      const limite = new Date(r.fechaLimiteDespacho).getTime();
      if (limite - now.getTime() < 24 * HORA_MS) {
        alertas.push({
          id: `venc-${r.id}`,
          tipo: "urgente",
          titulo: `Ruta ${r.id} próxima a vencer`,
          descripcion: `Plazo: ${new Date(r.fechaLimiteDespacho).toLocaleString("es-CO")}. ${r.paquetes.length} paquetes pendientes.`,
          fecha: r.fechaLimiteDespacho,
          rutaId: r.id,
          accion: "Despachar ahora",
        });
      }
    }

    if (r.estado === "Lista para Despacho" && r.motivoDespacho?.includes("90")) {
      alertas.push({
        id: `cap-${r.id}`,
        tipo: "urgente",
        titulo: `Ruta ${r.id} al 90% de capacidad`,
        descripcion: `${r.pesoTotal} kg en vehículo ${r.vehiculoRequerido}. Se recomienda despachar.`,
        fecha: r.fechaCreacion,
        rutaId: r.id,
        accion: "Despachar ahora",
      });
    }

    if (r.estado === "En Tránsito") {
      for (const p of r.paradas) {
        if (p.status === "Fallida" || p.status === "Novedad") {
          alertas.push({
            id: `fail-${r.id}-${p.numero}`,
            tipo: "info",
            titulo: `Parada ${p.status.toLowerCase()} en ruta ${r.id}`,
            descripcion:
              `Parada ${p.numero} (${p.destinatario}). ${p.motivoFallo ? `Motivo: ${p.motivoFallo}` : ""}`.trim(),
            fecha: r.fechaCreacion,
            rutaId: r.id,
            accion: null,
          });
        }
      }
    }
  }

  return alertas.sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === "urgente" ? -1 : 1;
    return b.fecha.localeCompare(a.fecha);
  });
}
