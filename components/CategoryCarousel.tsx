"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

type CategoryPreview = {
  name: string;
  image?: string;
  count: number;
};

interface CategoryCarouselProps {
  items: CategoryPreview[];
}

const SLOT = {
  "-2": { x: -360, scale: 0.60, zIndex: 1, opacity: 0.38, rotateY:  42 },
  "-1": { x: -195, scale: 0.80, zIndex: 2, opacity: 0.72, rotateY:  24 },
   "0": { x:    0, scale: 1.15, zIndex: 5, opacity: 1.00, rotateY:   0 },
   "1": { x:  195, scale: 0.80, zIndex: 2, opacity: 0.72, rotateY: -24 },
   "2": { x:  360, scale: 0.60, zIndex: 1, opacity: 0.38, rotateY: -42 },
} as const;

type SlotKey = keyof typeof SLOT;

function getSlotKey(index: number, center: number, total: number): SlotKey {
  let diff = ((index - center) % total + total) % total;
  if (diff > Math.floor(total / 2)) diff -= total;
  const clamped = Math.max(-2, Math.min(2, diff));
  return String(clamped) as SlotKey;
}

const SPRING = {
  type: "spring" as const,
  stiffness: 310,
  damping: 30,
  mass: 0.75,
};

export default function CategoryCarousel({ items }: CategoryCarouselProps) {
  const router = useRouter();
  const n = items.length;

  const [centerIndex, setCenterIndex] = useState(0);

  const prev = () => setCenterIndex((i) => (i - 1 + n) % n);
  const next = () => setCenterIndex((i) => (i + 1) % n);

  const pointerStartX = useRef<number | null>(null);
  const didDrag = useRef(false);

  const wheelCooldown = useRef(false);

  const onWheel = (e: React.WheelEvent) => {
    if (wheelCooldown.current) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 20) return;
    delta > 0 ? next() : prev();
    wheelCooldown.current = true;
    setTimeout(() => {
      wheelCooldown.current = false;
    }, 500);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    didDrag.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (
      pointerStartX.current !== null &&
      Math.abs(e.clientX - pointerStartX.current) > 8
    ) {
      didDrag.current = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const diff = e.clientX - pointerStartX.current;
    if (Math.abs(diff) > 70) {
      diff < 0 ? next() : prev();
    }
    pointerStartX.current = null;
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 select-none">
      <div
        className="relative mx-auto h-[280px] cursor-grab overflow-hidden active:cursor-grabbing sm:h-[330px] md:h-[370px]"
        style={{ perspective: "1200px", touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <div className="absolute inset-0 grid place-items-center">
          {items.map((item, i) => {
            const slotKey = getSlotKey(i, centerIndex, n);
            const { x, scale, zIndex, opacity, rotateY } = SLOT[slotKey];
            const isCenter = slotKey === "0";

            return (
              <motion.div
                key={item.name}
                animate={{ x, scale, opacity, rotateY }}
                transition={SPRING}
                style={{ zIndex, position: "absolute" }}
                className="w-[200px] sm:w-[238px] md:w-[265px]"
                onClick={() => {
                  if (didDrag.current) {
                    didDrag.current = false;
                    return;
                  }
                  if (!isCenter) {
                    setCenterIndex(i);
                  } else {
                    router.push(`/category/${encodeURIComponent(item.name)}`);
                  }
                }}
              >
                <div
                  className={[
                    "relative aspect-[5/4] overflow-hidden rounded-2xl transition-shadow duration-500",
                    isCenter
                      ? "shadow-[0_28px_56px_-16px_rgba(0,0,0,0.65)] ring-2 ring-white/50"
                      : "shadow-[0_12px_28px_-10px_rgba(0,0,0,0.40)]",
                  ].join(" ")}
                >
                  <img
                    src={item.image ?? "/placeholder.svg"}
                    alt={item.name}
                    draggable={false}
                    className={[
                      "h-full w-full object-cover transition-transform duration-700",
                      isCenter ? "hover:scale-110" : "",
                    ].join(" ")}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/20 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground sm:p-5">
                    <p className="font-display text-base font-semibold tracking-wide sm:text-lg">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-primary-foreground/75">
                      {item.count} items
                    </p>
                  </div>

                  {isCenter && (
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/30" />
                  )}

                  {isCenter && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
                        Tap to browse
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
