import { createClient } from "@/lib/supabase-browser";
import type { Product } from "@/data/products";

type ProductRow = {
  serial: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
  description: string | null;
  in_inventory: boolean;
};

type ProductRowWithImage = Omit<ProductRow, "image_url"> & { image_url: string };

const imageReachabilityCache = new Map<string, Promise<boolean>>();

function isValidImageUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

function checkImageReachable(url: string): Promise<boolean> {
  const normalized = url.trim();
  if (!normalized) return Promise.resolve(false);

  const cached = imageReachabilityCache.get(normalized);
  if (cached) return cached;

  const checkPromise = new Promise<boolean>((resolve) => {
    const img = new Image();
    const timeout = window.setTimeout(() => resolve(false), 5000);

    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(true);
    };

    img.onerror = () => {
      window.clearTimeout(timeout);
      resolve(false);
    };

    img.src = normalized;
  });

  imageReachabilityCache.set(normalized, checkPromise);
  return checkPromise;
}

async function filterRowsWithReachableImages(rows: ProductRow[]): Promise<ProductRowWithImage[]> {
  const checks = await Promise.all(
    rows.map(async (row) => {
      if (!isValidImageUrl(row.image_url)) return false;
      return checkImageReachable(row.image_url);
    })
  );

  return rows.filter(
    (row, index): row is ProductRowWithImage => checks[index] && isValidImageUrl(row.image_url)
  );
}

function dbRowToProduct(row: ProductRowWithImage): Product {
  return {
    id: row.serial,
    name: row.name,
    category: row.category,
    price: row.price,
    image_url: row.image_url,
    description: row.description ?? undefined,
    sku: row.serial,
    in_inventory: row.in_inventory,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("serial, name, category, price, image_url, description, in_inventory")
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("serial");

  if (error) {
    console.error("fetchAllProducts error:", error.message);
    return [];
  }

  const validRows = await filterRowsWithReachableImages((data ?? []) as ProductRow[]);
  return validRows.map(dbRowToProduct);
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("serial, name, category, price, image_url, description, in_inventory")
    .eq("category", category)
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("serial");

  if (error) {
    console.error("fetchProductsByCategory error:", error.message);
    return [];
  }

  const validRows = await filterRowsWithReachableImages((data ?? []) as ProductRow[]);
  return validRows.map(dbRowToProduct);
}

export async function fetchCategories(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("category, image_url")
    .not("image_url", "is", null)
    .neq("image_url", "")
    .order("category");

  if (error) {
    console.error("fetchCategories error:", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<{ category: string; image_url: string | null }>;
  const checks = await Promise.all(
    rows.map(async (row) => {
      if (!isValidImageUrl(row.image_url)) return false;
      return checkImageReachable(row.image_url);
    })
  );

  const categories = rows
    .filter((_row, index) => checks[index])
    .map((row) => row.category.trim())
    .filter((category) => category.length > 0);

  return [...new Set(categories)];
}
