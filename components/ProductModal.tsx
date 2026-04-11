"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAdmin } from "@/context/AdminContext";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  const specs = product?.technical_specs
    ? Object.entries(product.technical_specs)
    : [];

  const soldOut = !product?.in_inventory || !product?.image_url;
  const imgSrc = product?.image_url ?? "/placeholder.svg";

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed inset-x-4 top-[5vh] z-50 mx-auto max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-card shadow-2xl md:top-1/2 md:-translate-y-1/2 md:max-h-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-background/80 p-1.5 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="product-modal-body flex flex-col sm:flex-row">
              {/* Image */}
              <div className="relative w-full shrink-0 overflow-hidden bg-secondary/20 sm:w-56">
                <img
                  src={imgSrc}
                  alt={product.name}
                  className={`h-56 w-full object-contain sm:h-full ${soldOut ? "opacity-60 grayscale" : ""}`}
                />
                {soldOut && (
                  <div className="absolute left-3 top-3 rounded-md bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Sold Out
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col gap-4 p-6">
                {product.sku && (
                  <p className="text-xs font-mono font-medium uppercase tracking-widest text-muted-foreground">
                    {product.sku}
                  </p>
                )}

                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-0.5 text-sm font-semibold text-primary">
                    PKR {product.price.toLocaleString()}
                  </p>
                </div>

                {product.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}

                {specs.length > 0 && (
                  <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Ruler className="h-3.5 w-3.5" />
                      Dimensions
                    </div>
                    <dl className="flex flex-wrap gap-x-6 gap-y-1">
                      {specs.map(([key, val]) => (
                        <div key={key} className="flex items-baseline gap-1">
                          <dt className="text-xs capitalize text-muted-foreground">
                            {key}:
                          </dt>
                          <dd className="text-sm font-medium text-foreground">
                            {val}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {isAdmin ? null : soldOut ? (
                  <div className="mt-auto rounded-lg border border-border bg-muted px-6 py-2.5 text-center text-sm font-semibold text-muted-foreground">
                    Sold Out
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      addToCart(product);
                      onClose();
                    }}
                    className="mt-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
