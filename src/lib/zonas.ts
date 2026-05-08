// Zonas de operación que el Admin puede seleccionar al registrar/editar un vehículo.
// El backend espera `zonaOperacion` como string de EXACTAMENTE 5 caracteres
// (campo `zona_operacion VARCHAR(20)` con `@Size(min=5, max=5)` en VehiculoRequest;
// el campo está documentado como geohash de precisión 3 pero el endpoint sólo
// valida la longitud).
//
// Hasta que el frontend integre cálculo real de geohash desde coordenadas,
// usamos identificadores de 5 caracteres por zona — bastan para satisfacer
// la validación. PLAN-06 puede cambiar esto a geohashes reales.
export interface ZonaOperacion {
  label: string;
  geohash: string;
}

export const zonasOperacion: ZonaOperacion[] = [
  { label: "Zona Norte, Santa Marta", geohash: "ZNSMA" },
  { label: "Zona Centro, Santa Marta", geohash: "ZCSMA" },
  { label: "Zona Rodadero, Santa Marta", geohash: "ZRSMA" },
  { label: "Zona Mamatoco, Santa Marta", geohash: "ZMSMA" },
  { label: "Zona Gaira, Santa Marta", geohash: "ZGSMA" },
  { label: "Zona Bonda, Santa Marta", geohash: "ZBSMA" },
  { label: "Zona Bello Horizonte, Santa Marta", geohash: "ZHSMA" },
  { label: "Zona Taganga, Santa Marta", geohash: "ZTSMA" },
  { label: "Zona El Prado, Barranquilla", geohash: "ZPBQA" },
  { label: "Zona Soledad, Barranquilla", geohash: "ZSBQA" },
  { label: "Zona Única, Ciénaga", geohash: "ZUCIE" },
];

export function geohashToLabel(geohash: string): string {
  return zonasOperacion.find((z) => z.geohash === geohash)?.label ?? geohash;
}

export function labelToGeohash(label: string): string | undefined {
  return zonasOperacion.find((z) => z.label === label)?.geohash;
}
