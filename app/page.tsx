"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/effect-coverflow";
import CategoryCarousel from "@/components/CategoryCarousel";
import { categories, getProductsByCategory } from "@/data/products";

export default function Index() {
  // Hero uses first product image from each category as preview
  const categoryPreviews = categories.map(cat => {
    const products = getProductsByCategory(cat);
    return { name: cat, image: products[0]?.image, count: products.length };
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl font-bold text-primary-foreground md:text-6xl"
          >
            LumberWiz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-primary-foreground/80 text-lg"
          >
            Handcrafted pieces that bring warmth, texture, and timeless beauty to your space.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link
              href={`/category/${encodeURIComponent(categories[0])}`}
              className="mt-8 inline-block rounded-lg bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary hover:bg-primary-foreground/90 transition-colors"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h2 className="text-center font-display text-3xl font-bold text-foreground">Shop by Category</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
            Swipe to explore our five signature collections. The centered category is highlighted for quick browsing.
          </p>
          <CategoryCarousel items={categoryPreviews} />
        </motion.div>
      </section>

    </div>
  );
}
