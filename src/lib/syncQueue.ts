import { getDB } from "./db";
import type { RegistrarParadaRequest } from "@/types/dto/parada";

export type ActionType = "INICIAR_RUTA" | "REGISTRAR_PARADA" | "CERRAR_RUTA";

export interface IniciarRutaPayload {
  rutaId: string;
}

export interface RegistrarParadaPayload {
  paradaId: string;
  req: RegistrarParadaRequest;
}

export interface CerrarRutaPayload {
  rutaId: string;
  confirmarConPendientes: boolean;
}

export interface ActionQueueItem {
  id: string;
  type: ActionType;
  payload: IniciarRutaPayload | RegistrarParadaPayload | CerrarRutaPayload;
  createdAt: number;
  intentos: number;
}

export async function enqueue(
  type: ActionType,
  payload: IniciarRutaPayload | RegistrarParadaPayload | CerrarRutaPayload,
): Promise<string> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const item: ActionQueueItem = { id, type, payload, createdAt: Date.now(), intentos: 0 };
  await db.put("actionQueue", item);
  return id;
}

export async function getQueue(): Promise<ActionQueueItem[]> {
  const db = await getDB();
  return (db.getAllFromIndex("actionQueue", "by-createdAt") as Promise<ActionQueueItem[]>);
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("actionQueue", id);
}

export async function incrementIntento(id: string): Promise<void> {
  const db = await getDB();
  const item = (await db.get("actionQueue", id)) as ActionQueueItem | undefined;
  if (item) await db.put("actionQueue", { ...item, intentos: item.intentos + 1 });
}

export async function queueSize(): Promise<number> {
  const db = await getDB();
  return db.count("actionQueue");
}
