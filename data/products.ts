// Exports the Product type only.
// All product data is fetched live from Supabase — see lib/products.ts.

export interface Product {
  id: string;              // maps to DB `serial`
  name: string;
  category: string;
  price: number;
  image_url: string;        // maps to DB `image_url`; empty string means no image
  description?: string;
  technical_specs?: Record<string, string>;
  sku?: string;
  in_inventory: boolean;   // maps to DB `in_inventory`
}
