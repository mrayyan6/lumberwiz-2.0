"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { fetchProductsByCategory } from "@/lib/products";
import { useAdmin } from "@/context/AdminContext";
import type { Product } from "@/data/products";

export default function CategoryPage() {
  const params = useParams<{ name?: string | string[] }>();
  const rawName = Array.isArray(params?.name) ? params.name[0] : params?.name;
  const category = decodeURIComponent(rawName || "");

  const { isAdmin, openAdd } = useAdmin();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Product | null>(null);

  const refreshProducts = useCallback(() => {
    if (!category) return;
    setLoading(true);
    fetchProductsByCategory(category).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [category]);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  return (
    <div>
      {/* Category header */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Collection</p>
              <h1 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">
                {category}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                {!loading && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {products.length} {products.length === 1 ? "product" : "products"}
                  </span>
                )}
              </div>
            </div>

            {/* Add Product button — admin only */}
            {isAdmin && (
              <motion.button
                onClick={() => openAdd(category, refreshProducts)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-1 flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-shadow hover:shadow-md"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl border border-border bg-secondary/40"
              />
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center text-muted-foreground"
          >
            No products found in this category.
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          >
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onCardClick={setSelected}
                onRefresh={refreshProducts}
              />
            ))}
          </motion.div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
