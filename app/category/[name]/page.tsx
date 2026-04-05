"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory } from "@/data/products";

export default function CategoryPage() {
  const params = useParams<{ name?: string | string[] }>();
  const rawName = Array.isArray(params?.name) ? params.name[0] : params?.name;
  const category = decodeURIComponent(rawName || "");
  const products = getProductsByCategory(category);

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold text-foreground md:text-4xl"
      >
        {category}
      </motion.h1>
      <p className="mt-2 text-muted-foreground">{products.length} products</p>
      <div className="mt-8 grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="py-20 text-center text-muted-foreground">No products found in this category.</p>
      )}
    </div>
  );
}
