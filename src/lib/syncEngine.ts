import { miRutaService } from "@/services/conductor";
import { getDB } from "./db";
import {
  getQueue,
  removeFromQueue,
  incrementIntento,
  type IniciarRutaPayload,
  type RegistrarParadaPayload,
  type CerrarRutaPayload,
} from "./syncQueue";

let processing = false;
const changeListeners = new Set<() => void>();

export function onSyncChange(cb: () => void): () => void {
  changeListeners.add(cb);
  return () => changeListeners.delete(cb);
}

function notify() {
  changeListeners.forEach((cb) => cb());
}

export function isSyncing(): boolean {
  return processing;
}

export async function processQueue(): Promise<void> {
  if (processing || !navigator.onLine) return;
  processing = true;
  notify();

  try {
    const queue = await getQueue();
    for (const item of queue) {
      try {
        if (item.type === "INICIAR_RUTA") {
          const { rutaId } = item.payload as IniciarRutaPayload;
          await miRutaService.iniciarRuta(rutaId);
        } else if (item.type === "REGISTRAR_PARADA") {
          const { paradaId, req } = item.payload as RegistrarParadaPayload;
          let fotoUrl = req.fotoUrl;

          // Si la parada era exitosa y quedó pendiente el blob, subirlo primero
          if (req.tipo === "EXITOSA" && !fotoUrl) {
            const db = await getDB();
            const pendiente = (await db.get("fotosPendientes", paradaId)) as
              | { blob: Blob }
              | undefined;
            if (pendiente) {
              const res = await miRutaService.subirFoto(paradaId, pendiente.blob);
              fotoUrl = res.url;
              await db.delete("fotosPendientes", paradaId);
            }
          }

          await miRutaService.registrarParada(paradaId, { ...req, fotoUrl });
        } else if (item.type === "CERRAR_RUTA") {
          const { rutaId, confirmarConPendientes } = item.payload as CerrarRutaPayload;
          await miRutaService.cerrarRuta(rutaId, { confirmarConPendientes });
        }

        await removeFromQueue(item.id);
        notify();
      } catch {
        await incrementIntento(item.id);
      }
    }
  } finally {
    processing = false;
    notify();
    // Avisa a useRutaActiva para que refetchee con datos frescos del backend
    window.dispatchEvent(new CustomEvent("sync:queue-processed"));
  }
}

let initialized = false;

export function initSyncEngine(): void {
  if (initialized) return;
  initialized = true;
  window.addEventListener("online", () => processQueue());
}
