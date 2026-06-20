import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Lumberwiz — Terracotta Planters & Marble Decor | Home & Garden Pakistan",
  description:
    "Shop terracotta planters, marble decor, pots, vases, and home accessories at Lumberwiz. Perfect for indoor & outdoor decoration in Pakistan. Durable, handcrafted, and stylish designs.",
};

type CategoryPreview = {
  name: string;
  image?: string;
  count: number;
};

type ProductRow = {
  category: string;
  image_url: string | null;
};

export type HomeReview = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  category: string;
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

// Top reviews: highest-rated first, then most recent. Limited to 5 for the carousel.
async function fetchTopReviews(): Promise<HomeReview[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, customer_name, rating, comment, category")
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("fetchTopReviews error:", error.message);
      return [];
    }
    return (data ?? []) as HomeReview[];
  } catch {
    return [];
  }
}

export default async function Index() {
  const [allProducts, reviews] = await Promise.all([
    fetchProductsForHome(),
    fetchTopReviews(),
  ]);

  const categoryMap = new Map<string, CategoryPreview>();
  for (const p of allProducts) {
    const cat = p.category?.trim();
    if (!cat) continue;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { name: cat, image: p.image_url ?? undefined, count: 1 });
    } else {
      categoryMap.get(cat)!.count++;
    }
  }
  const categoryPreviews = [...categoryMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return <HomePageClient categoryPreviews={categoryPreviews} reviews={reviews} />;
}
