import { useState, useEffect } from "react";
import { queueSize } from "@/lib/syncQueue";
import { onSyncChange, isSyncing } from "@/lib/syncEngine";

export function useSyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      const count = await queueSize();
      if (!cancelled) {
        setPendingCount(count);
        setSyncing(isSyncing());
      }
    };

    refresh();
    const unsub = onSyncChange(refresh);

    const handleOnline = () => {
      setIsOnline(true);
      refresh();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      cancelled = true;
      unsub();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, pendingCount, syncing };
}
