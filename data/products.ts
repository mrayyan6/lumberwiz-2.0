import plantersData from "./products/planters.json";
import vasesData from "./products/vases.json";
import lampsData from "./products/lamps.json";
import marbleLampsData from "./products/marble-lamps.json";
import desktopPlantersData from "./products/desktop-planters.json";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  technical_specs?: Record<string, string>;
  sku?: string;
}

function toProduct(
  item: {
    id: string;
    name: string;
    image_path: string | null;
    description: string;
    // JSON-inferred types may have optional keys; cast to Record for safety
    technical_specs: Record<string, string | undefined>;
  },
  category: string,
  price = 10000
): Product {
  return {
    id: item.id,
    name: item.name,
    category,
    price,
    image: item.image_path ?? "/placeholder.svg",
    description: item.description,
    technical_specs: item.technical_specs as Record<string, string>,
    sku: item.id,
  };
}

const desktopPlanters: Product[] = desktopPlantersData
  .filter((p) => p.image_path !== null)
  .map((p) => toProduct(p, "Desktop Planters"));

const terracottaLamps: Product[] = lampsData.map((p) =>
  toProduct(p, "Terracotta Lamps")
);

const marbleLamps: Product[] = marbleLampsData
  .filter((p) => p.image_path !== null)
  .map((p) => toProduct(p, "Marble Lamps"));

const terracottaPlanters: Product[] = plantersData.map((p) =>
  toProduct(p, "Terracotta Planters")
);

const terracottaVases: Product[] = vasesData
  .filter((p) => p.image_path !== null)
  .map((p) => toProduct(p, "Terracotta Vase"));

export const allProducts: Product[] = [
  ...desktopPlanters,
  ...terracottaLamps,
  ...marbleLamps,
  ...terracottaPlanters,
  ...terracottaVases,
];

export const categories = [
  "Desktop Planters",
  "Terracotta Lamps",
  "Marble Lamps",
  "Terracotta Planters",
  "Terracotta Vase",
];

export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter((p) => p.category === category);
}
