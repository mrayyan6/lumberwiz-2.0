"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-lg bg-card border border-border"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imgError ? "/placeholder.svg" : product.image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/20" />
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-3 right-3 rounded-full bg-primary p-2.5 text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-display text-sm font-medium text-foreground truncate">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-primary">PKR {product.price.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}
