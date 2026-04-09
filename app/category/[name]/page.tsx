"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { Product, getProductsByCategory } from "@/data/products";

export default function CategoryPage() {
  const params = useParams<{ name?: string | string[] }>();
  const rawName = Array.isArray(params?.name) ? params.name[0] : params?.name;
  const category = decodeURIComponent(rawName || "");
  const products = getProductsByCategory(category);

  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <div>
      {/* Category header */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Collection</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">
              {category}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {products.length} {products.length === 1 ? "product" : "products"}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products grid */}
      <div className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
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
              />
            ))}
          </motion.div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
