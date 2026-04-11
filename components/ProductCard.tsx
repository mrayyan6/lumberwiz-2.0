"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ShoppingCart, Pencil } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAdmin } from "@/context/AdminContext";

export default function ProductCard({
  product,
  index = 0,
  onCardClick,
  onRefresh,
}: {
  product: Product;
  index?: number;
  onCardClick?: (product: Product) => void;
  onRefresh?: () => void;
}) {
  const { addToCart } = useCart();
  const { isAdmin, openEdit } = useAdmin();
  const [imgError, setImgError] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    setIsTouched(true);
    touchTimer.current = setTimeout(() => setIsTouched(false), 600);
  };

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

  const soldOut = !product.in_inventory;
  const imgSrc = imgError || !product.image_url ? "/placeholder.svg" : product.image_url;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={() => onCardClick?.(product)}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl${isTouched ? " is-touched" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          className={`product-card-image h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 group-active:scale-110 ${soldOut && !isAdmin ? "opacity-60 grayscale" : ""}`}
        />
        {/* Hover overlay */}
        <div className="product-card-overlay absolute inset-0 bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/[0.18] group-active:bg-foreground/[0.18]" />

        {/* Sold Out badge — shown to regular users only */}
        {soldOut && !isAdmin && (
          <div className="absolute left-2 top-2 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sold Out
          </div>
        )}

        {/* Admin: pencil edit icon */}
        {isAdmin ? (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              openEdit(product, onRefresh);
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-4 right-3 rounded-full bg-primary p-2.5 text-primary-foreground shadow-lg transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100 md:opacity-0"
          >
            <Pencil className="h-4 w-4" />
          </motion.button>
        ) : (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (!soldOut) addToCart(product);
            }}
            whileHover={soldOut ? undefined : { scale: 1.15 }}
            whileTap={soldOut ? undefined : { scale: 0.9 }}
            disabled={soldOut}
            aria-disabled={soldOut}
            className={`absolute bottom-3 right-3 rounded-full p-2.5 shadow-lg transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100 md:opacity-0 ${
              soldOut
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
            }`}
            title={soldOut ? "Sold Out" : "Add to Cart"}
          >
            <ShoppingCart className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-sm font-medium text-foreground truncate">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-primary">PKR {product.price.toLocaleString()}</p>
        {soldOut && !isAdmin && (
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Sold Out</p>
        )}
      </div>

      {/* Bottom glow on hover */}
      <div className="product-card-glow pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100" />
    </motion.div>
  );
}
