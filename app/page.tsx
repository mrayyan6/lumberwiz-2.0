import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Lumberwiz — Premium Timber & Wood Products",
  description:
    "Browse Lumberwiz's collection of premium timber, wood panels, and lumber products. Quality wood for construction, furniture, and more.",
};

const categories = [
  "Desktop Planters",
  "Terracotta Lamps",
  "Marble Lamps",
  "Terracotta Planters",
  "Terracotta Vase",
];

type CategoryPreview = {
  name: string;
  image?: string;
  count: number;
};

type ProductRow = {
  category: string;
  image_url: string | null;
};

async function fetchProductsForHome(): Promise<ProductRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("category, image_url")
      .not("image_url", "is", null)
      .neq("image_url", "")
      .order("serial");

    if (error) {
      console.error("fetchProductsForHome error:", error.message);
      return [];
    }
    return (data ?? []) as ProductRow[];
  } catch {
    return [];
  }
}

export default async function Index() {
  const allProducts = await fetchProductsForHome();

  const categoryPreviews: CategoryPreview[] = categories.map((cat) => {
    const products = allProducts.filter((p) => p.category === cat);
    return {
      name: cat,
      image: products[0]?.image_url ?? undefined,
      count: products.length,
    };
  });

  return <HomePageClient categoryPreviews={categoryPreviews} />;
}
