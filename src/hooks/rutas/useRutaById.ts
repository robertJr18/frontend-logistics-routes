import { useRutas } from "./useRutas";

export function useRutaById(id: string | undefined) {
  const query = useRutas();
  return {
    ...query,
    data: id ? query.data?.find((r) => r.id === id) : undefined,
  };
}
