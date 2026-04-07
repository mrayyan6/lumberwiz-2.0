"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt springs
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useSpring(x, { stiffness: 260, damping: 22 });
  const rotateX = useSpring(y, { stiffness: 260, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 16);
    y.set(-((e.clientY - rect.top) / rect.height - 0.5) * 16);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imgError ? "/placeholder.svg" : product.image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/18" />

        {/* Add to cart button */}
        <motion.button
          onClick={() => addToCart(product)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="absolute bottom-3 right-3 rounded-full bg-primary p-2.5 text-primary-foreground opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="p-4">
        <h3 className="font-display text-sm font-medium text-foreground truncate">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-primary">PKR {product.price.toLocaleString()}</p>
      </div>

      {/* Bottom glow on hover */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}
