import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

type CategoryRow = {
  category: string | null;
};

const FALLBACK_SITE_URL = "http://localhost:3000";

export const revalidate = 3600;

function getBaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!rawUrl) return FALLBACK_SITE_URL;

  try {
    return new URL(rawUrl).origin;
  } catch {
    try {
      return new URL(`https://${rawUrl}`).origin;
    } catch {
      return FALLBACK_SITE_URL;
    }
  }
}

function createStaticRoutes(baseUrl: string): MetadataRoute.Sitemap {
  // Intentionally exclude /admin and /login because these routes are noindex.
  return ["/", "/about"].map((path) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified: new Date(),
  }));
}

async function createCategoryRoutes(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null)
    .neq("category", "");

  if (error) {
    console.error("sitemap category query error:", error.message);
    return [];
  }

  const categories = [...new Set(
    ((data ?? []) as CategoryRow[])
      .map((row) => row.category?.trim())
      .filter((category): category is string => Boolean(category))
  )].sort((a, b) => a.localeCompare(b));

  return categories.map((category) => ({
    url: new URL(`/category/${encodeURIComponent(category)}`, baseUrl).toString(),
    lastModified: new Date(),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const staticRoutes = createStaticRoutes(baseUrl);
  const categoryRoutes = await createCategoryRoutes(baseUrl);

  return [...staticRoutes, ...categoryRoutes];
}
