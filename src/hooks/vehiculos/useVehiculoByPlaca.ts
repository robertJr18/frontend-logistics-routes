import { useVehiculos } from "./useVehiculos";

export function useVehiculoByPlaca(placa: string | undefined) {
  const query = useVehiculos();
  return {
    ...query,
    data: placa ? query.data?.find((v) => v.placa === placa) : undefined,
  };
}
