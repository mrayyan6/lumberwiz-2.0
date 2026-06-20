"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  /** Current rating value (1-5). For interactive use this is the committed value. */
  rating: number;
  /** If provided, the component is interactive (hover preview + click to set). */
  onChange?: (value: number) => void;
  /** Visual size of each star. */
  size?: "sm" | "md" | "lg";
  /** Stagger a fill-in animation when the component first mounts (display mode). */
  animated?: boolean;
}

const SIZE_CLASS = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
} as const;

/**
 * Reusable star rating used in two places:
 *   - Review submission form  → interactive (pass onChange)
 *   - Home page testimonials   → read-only display (omit onChange, optionally animated)
 */
export default function StarRating({ rating, onChange, size = "md", animated = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";
  const cls = SIZE_CLASS[size];

  // The value to render as "filled": hover preview wins while interacting.
  const shown = interactive && hover > 0 ? hover : rating;

  return (
    <div className="flex items-center gap-1" role={interactive ? "radiogroup" : "img"} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= shown;
        return (
          <motion.button
            key={value}
            type="button"
            disabled={!interactive}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onMouseEnter={interactive ? () => setHover(value) : undefined}
            onMouseLeave={interactive ? () => setHover(0) : undefined}
            onClick={interactive ? () => onChange!(value) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
            // Mount animation: staggered scale/opacity fill-in for display mode
            initial={animated ? { opacity: 0, scale: 0.4 } : false}
            whileInView={animated ? { opacity: 1, scale: 1 } : undefined}
            viewport={animated ? { once: true } : undefined}
            transition={animated ? { delay: value * 0.08, type: "spring", stiffness: 300, damping: 18 } : undefined}
            // Interaction animation
            whileHover={interactive ? { scale: 1.2 } : undefined}
            whileTap={interactive ? { scale: 0.9 } : undefined}
          >
            <Star
              className={`${cls} transition-colors ${
                filled ? "fill-primary text-primary" : "fill-transparent text-muted-foreground/40"
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
