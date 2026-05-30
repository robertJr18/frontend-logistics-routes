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
