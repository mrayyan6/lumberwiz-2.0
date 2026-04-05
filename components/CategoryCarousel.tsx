"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { A11y, EffectCoverflow, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";

type CategoryPreview = {
  name: string;
  image?: string;
  count: number;
};

interface CategoryCarouselProps {
  items: CategoryPreview[];
}

function getDistanceFromCenter(index: number, activeIndex: number, total: number) {
  const rawDistance = Math.abs(index - activeIndex);
  return Math.min(rawDistance, total - rawDistance);
}

function getScale(distance: number) {
  if (distance <= 0) return 1.15;
  if (distance === 1) return 0.98;
  return 0.9;
}

export default function CategoryCarousel({ items }: CategoryCarouselProps) {
  const router = useRouter();
  const [activeRealIndex, setActiveRealIndex] = useState(0);
  const loopedItems = [...items, ...items, ...items];

  const handleSlideClick = (event: React.MouseEvent<HTMLAnchorElement>, realIndex: number) => {
    if (realIndex !== activeRealIndex) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const item = items[realIndex];
    if (!item) return;
    router.push(`/category/${encodeURIComponent(item.name)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mt-10 overflow-x-hidden [perspective:1400px]"
    >
      <Swiper
        modules={[EffectCoverflow, Mousewheel, A11y]}
        effect="coverflow"
        centeredSlides={true}
        centeredSlidesBounds
        slidesPerView={3}
        spaceBetween={17}
        speed={700}
        loop={true}
        loopAdditionalSlides={5}
        watchSlidesProgress
        slideToClickedSlide
        grabCursor
        allowTouchMove
        mousewheel={{ forceToAxis: true, sensitivity: 0.7 }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 220,
          modifier: 1.2,
          slideShadows: false,
        }}
        breakpoints={{
          640: { slidesPerView: 5, spaceBetween: 20 },
          768: { slidesPerView: 5, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 20 },
        }}
        onSwiper={(swiper) => setActiveRealIndex(items.length ? swiper.realIndex % items.length : 0)}
        onSlideChange={(swiper) => setActiveRealIndex(items.length ? swiper.realIndex % items.length : 0)}
        className="!overflow-hidden [touch-action:pan-y] px-1 py-4 sm:px-4"
      >
        {loopedItems.map((item, index) => {
          const realIndex = items.length ? index % items.length : 0;
          const distance = getDistanceFromCenter(realIndex, activeRealIndex, items.length);
          const scale = getScale(distance);
          const isCenter = distance === 0;

          return (
            <SwiperSlide key={`${item.name}-${index}`} className="!h-auto">
              <motion.div
                animate={{
                  scale,
                  opacity: isCenter ? 1 : distance === 1 ? 0.86 : 0.72,
                  y: isCenter ? 0 : distance === 1 ? 8 : 14,
                }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 28,
                  mass: 0.8,
                }}
                whileHover={{
                  y: -8,
                  scale: isCenter ? 1.04 : Math.min(scale + 0.08, 1),
                }}
                className="mx-auto h-full w-full max-w-[360px]"
              >
                <Link
                  href={`/category/${encodeURIComponent(item.name)}`}
                  onClick={(event) => handleSlideClick(event, realIndex)}
                  className="group relative block aspect-[5/4] overflow-hidden rounded-2xl border border-white/20 bg-black/20 shadow-[0_22px_50px_-28px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-all duration-500"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground sm:p-6">
                    <p className="font-display text-xl font-semibold tracking-wide sm:text-2xl">{item.name}</p>
                    <p className="mt-1 text-xs text-primary-foreground/85 sm:text-sm">{item.count} items</p>
                  </div>
                  <div
                    className={[
                      "pointer-events-none absolute inset-0 rounded-2xl transition-all duration-500",
                      isCenter
                        ? "ring-2 ring-primary-foreground/90 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.32)]"
                        : "ring-1 ring-white/20",
                    ].join(" ")}
                  />
                </Link>
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </motion.div>
  );
}
