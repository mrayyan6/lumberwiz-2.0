import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import CategoryPageClient from "@/components/CategoryPageClient";
import type { Product } from "@/data/products";

type Props = {
  params: Promise<{ name: string }>;
};

type ProductRow = {
  serial: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  description: string | null;
  in_inventory: boolean;
};

async function fetchProductsByCategoryServer(category: string): Promise<Product[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("serial, name, category, price, image_url, description, in_inventory")
      .eq("category", category)
      .not("image_url", "is", null)
      .neq("image_url", "")
      .order("serial");

    if (error) {
      console.error("fetchProductsByCategory (server) error:", error.message);
      return [];
    }

    return ((data ?? []) as ProductRow[]).map((row) => ({
      id: row.serial,
      name: row.name,
      category: row.category,
      price: row.price,
      image_url: row.image_url,
      description: row.description ?? undefined,
      sku: row.serial,
      in_inventory: row.in_inventory,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const category = decodeURIComponent(name);
  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${capitalizedCategory} — Lumberwiz`,
    description: `Shop ${capitalizedCategory} products at Lumberwiz. Premium quality timber and wood products available.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const category = decodeURIComponent(name);
  const products = await fetchProductsByCategoryServer(category);

  return <CategoryPageClient initialProducts={products} category={category} />;
}
