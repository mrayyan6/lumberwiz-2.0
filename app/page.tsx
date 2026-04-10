"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ShoppingBag, Leaf, Sparkles, Star, ChevronDown } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import CategoryCarousel from "@/components/CategoryCarousel";
import { categories, getProductsByCategory } from "@/data/products";
import { Variants } from 'framer-motion';

const testimonials = [
  {
    name: "Aisha K.",
    location: "Lahore",
    text: "The terracotta planter is absolutely stunning. It's become the centerpiece of my living room and everyone who visits asks about it.",
    rating: 5,
  },
  {
    name: "Omar S.",
    location: "Karachi",
    text: "Exceptional quality and craftsmanship. The marble lamp casts the most beautiful warm light in the evening.",
    rating: 5,
  },
  {
    name: "Fatima R.",
    location: "Islamabad",
    text: "I ordered three desktop planters and they arrived perfectly packaged. The earthy tones are even more beautiful in person.",
    rating: 5,
  },
  {
    name: "Zaid M.",
    location: "Peshawar",
    text: "LumberWiz completely transformed my workspace. The attention to detail in each piece is remarkable.",
    rating: 5,
  },
];

const features = [
  {
    icon: Leaf,
    title: "Natural Materials",
    desc: "Sourced ethically from the finest clay deposits, each piece honours the earth it comes from.",
  },
  {
    icon: ShoppingBag,
    title: "Master Crafted",
    desc: "Shaped by artisans whose families have practiced terracotta work for generations.",
  },
  {
    icon: Sparkles,
    title: "Timeless Design",
    desc: "Pieces that transcend trends — at home in contemporary spaces yet rooted in ancient tradition.",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const blobX = useSpring(mouseX, { stiffness: 28, damping: 22 });
  const blobY = useSpring(mouseY, { stiffness: 28, damping: 22 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const categoryPreviews = categories.map((cat) => {
    const products = getProductsByCategory(cat);
    return { name: cat, image: products[0]?.image, count: products.length };
  });

  return (
    <div>
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative flex min-h-[82vh] items-center overflow-hidden bg-primary py-28 md:py-40"
      >
        {/* Mouse-following animated blob */}
        <motion.div
          style={{ x: blobX, y: blobY }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1.05, 1.12, 1],
              borderRadius: [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 60% 70% 40% / 50% 60% 30% 60%",
                "50% 60% 40% 60% / 40% 50% 60% 50%",
                "60% 40% 30% 70% / 60% 30% 70% 40%",
              ],
            }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
            className="h-[540px] w-[540px] bg-primary-foreground/10 blur-3xl"
          />
        </motion.div>

        {/* Static accent blob */}
        <motion.div
          animate={{ scale: [1, 1.09, 1], opacity: [0.07, 0.14, 0.07] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="pointer-events-none absolute -bottom-24 -right-16 h-[380px] w-[380px] rounded-full bg-primary-foreground/15 blur-3xl"
        />

        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants}>
              <span className="inline-block rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary-foreground/80 backdrop-blur-sm">
                Handcrafted Artisan Décor
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl font-bold leading-tight text-primary-foreground md:text-7xl"
            >
              LumberWiz
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-xl text-lg text-primary-foreground/80"
            >
              Handcrafted pieces that bring warmth, texture, and timeless beauty to your space.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/category/${encodeURIComponent(categories[0])}`}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-primary-foreground px-8 py-3.5 text-sm font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Now
                <span className="absolute inset-0 -translate-x-full bg-primary/8 transition-transform duration-300 group-hover:translate-x-0" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/40 px-8 py-3.5 text-sm font-medium text-primary-foreground/90 backdrop-blur-sm transition-all duration-300 hover:border-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                Our Story
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="text-primary-foreground/40"
            >
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Why LumberWiz</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-lg"
              >
                {/* Hover gradient accent */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Layered Depth — Brand Story ── */}
      <section className="overflow-hidden bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-12 lg:flex-row">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex-1 space-y-5"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                Rooted in Heritage
              </span>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                Where Ancient Craft Meets Modern Living
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every LumberWiz piece begins as raw clay shaped by artisans whose families have practiced the craft for
                generations. In traditional kilns, clay becomes terracotta — strong, porous, and alive with warmth.
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                Learn our full story
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>

            {/* Layered pseudo-3D images */}
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="relative flex-1 brand-story-image-wrapper"
              style={{ perspective: "900px" }}
            >
              <div className="relative h-[360px] md:h-[380px] brand-story-image-container">
                {/* Back card */}
                <motion.div
                  initial={{ rotateY: -8, rotateX: 4 }}
                  whileInView={{ rotateY: -3, rotateX: 2 }}
                  whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="absolute left-8 top-8 h-full w-[85%] overflow-hidden rounded-2xl shadow-2xl brand-story-back-card"
                >
                  {categoryPreviews[1]?.image && (
                    <img
                      src={categoryPreviews[1].image}
                      alt="Artisan craft"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </motion.div>

                {/* Front floating card */}
                <motion.div
                  initial={{ rotateY: 6, rotateX: -4, y: 20 }}
                  whileInView={{ rotateY: 2, rotateX: -1, y: 0 }}
                  whileHover={{ rotateY: 0, rotateX: 0, y: -6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="absolute bottom-4 right-4 h-36 w-36 overflow-hidden rounded-xl border-4 border-background shadow-xl md:-bottom-6 md:-right-2 md:h-52 md:w-52 brand-story-front-card"
                >
                  {categoryPreviews[0]?.image && (
                    <img
                      src={categoryPreviews[0].image}
                      alt="Terracotta detail"
                      className="h-full w-full object-cover"
                    />
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Category Carousel ── */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <h2 className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
              Shop by Category
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
              Swipe to explore our five signature collections. The centered category is highlighted for quick browsing.
            </p>
            <CategoryCarousel items={categoryPreviews} />
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-secondary/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              Real stories from people who brought LumberWiz into their homes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.55 }}
            className="mt-10"
          >
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
              pagination={{ clickable: true }}
              loop={true}
              slidesPerView={1}
              spaceBetween={24}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="!pb-12"
            >
              {testimonials.map((t, i) => (
                <SwiperSlide key={i} className="h-auto">
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-3 flex gap-1">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.location}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
