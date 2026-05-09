import { openDB } from "idb";

const DB_NAME = "logistics-conductor";
const DB_VERSION = 1;

// Singleton promise — se reutiliza en toda la app
let _db: ReturnType<typeof openDB> | null = null;

export function getDB() {
  if (!_db) {
    _db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("rutaActiva")) {
          db.createObjectStore("rutaActiva");
        }
        if (!db.objectStoreNames.contains("actionQueue")) {
          const store = db.createObjectStore("actionQueue", { keyPath: "id" });
          store.createIndex("by-createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("fotosPendientes")) {
          db.createObjectStore("fotosPendientes", { keyPath: "paradaId" });
        }
      },
    });
  }
  return _db;
}
