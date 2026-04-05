export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

const desktopPlanters: Product[] = [1,2,4,5,6,7,8,9,10,11,12].map((n, i) => ({
  id: `dp-${n}`,
  name: `Desktop Planter ${n}`,
  category: "Desktop Planters",
  price: 10000,
  image: `/images/Desktop Planter (${n}).jpeg`,
}));

const terracottaLamps: Product[] = [1,2,3].map(n => ({
  id: `tl-${n}`,
  name: `Terracotta Lamp ${n}`,
  category: "Terracotta Lamps",
  price: 10000,
  image: `/images/Lamps (${n}).jpeg`,
}));

const marbleLamps: Product[] = [{
  id: "ml-1",
  name: "Marble Lamp",
  category: "Marble Lamps",
  price: 10000,
  image: "/images/Marble Lamp.jpeg",
}];

const terracottaPlanters: Product[] = [
  ...Array.from({length: 14}, (_, i) => ({
    id: `tp-${i+1}`,
    name: `Terracotta Planter ${i+1}`,
    category: "Terracotta Planters",
    price: 10000,
    image: `/images/Planter (${i+1}).jpeg`,
  })),
  {
    id: "tp-0",
    name: "Terracotta Planter",
    category: "Terracotta Planters",
    price: 10000,
    image: "/images/Planter.jpeg",
  },
];

const terracottaVases: Product[] = [
  ...Array.from({length: 26}, (_, i) => ({
    id: `tv-${i+1}`,
    name: `Terracotta Vase ${i+1}`,
    category: "Terracotta Vase",
    price: 10000,
    image: `/images/Vase (${i+1}).jpeg`,
  })),
  {
    id: "tv-0",
    name: "Terracotta Vase",
    category: "Terracotta Vase",
    price: 10000,
    image: "/images/Vase.jpeg",
  },
];

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
  return allProducts.filter(p => p.category === category);
}
