"use client";

import { motion } from "framer-motion";
import { Leaf, Flame, Eye, Mail, Instagram, MessageCircle } from "lucide-react";

const sections = [
  {
    icon: Leaf,
    title: "Our Story",
    paragraphs: [
      "LumberWiz was born from a deep reverence for the art of terracotta — a material that has shaped human civilization for millennia. Our journey began with a simple observation: the most beautiful spaces are those that carry a sense of soul, of hands that shaped them, of earth that gave them form.",
      "We partner with master artisans whose families have practiced the craft for generations. Each piece in our collection carries the imprint of this heritage — the subtle irregularities of hand-thrown clay, the warmth of natural earth tones, the quiet confidence of timeless design.",
    ],
  },
  {
    icon: Flame,
    title: "Craftsmanship",
    paragraphs: [
      "Every LumberWiz piece begins as raw clay, carefully selected for its mineral composition and workability. Our artisans shape each item by hand, using techniques refined over centuries — coiling, throwing, and sculpting with an intimacy that no machine can replicate.",
      "The firing process is where transformation happens. In traditional kilns heated to precise temperatures, clay becomes terracotta — strong, porous, and alive with warmth. Our planters breathe with your plants. Our lamps cast light through forms that tell stories. Our vases hold both flowers and the weight of tradition.",
      "From desktop planters that bring nature to your workspace, to statement vases that anchor a room, to terracotta and marble lamps that create atmosphere — every product is a testament to the beauty of handmade objects in a mass-produced world.",
    ],
  },
  {
    icon: Eye,
    title: "Our Vision",
    paragraphs: [
      "We envision a world where the objects we live with carry meaning — where a planter on your desk connects you to the earth, where a lamp in your living room carries the warmth of a craftsman's hands, where beauty and purpose are inseparable.",
      "LumberWiz exists to bridge the gap between artisanal heritage and modern living. We curate pieces that are at once rooted in tradition and perfectly at home in contemporary spaces. Our commitment is to sustainability, fair craft, and the enduring belief that handmade objects elevate everyday life.",
    ],
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-28">
        {/* Soft ambient blob */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.16, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-16 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-foreground/20 blur-3xl"
        />

        <div className="container relative mx-auto px-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary-foreground/80"
          >
            Who We Are
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 font-display text-4xl font-bold text-primary-foreground md:text-5xl"
          >
            About LumberWiz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80"
          >
            Where ancient craft meets contemporary design
          </motion.p>
        </div>
      </section>

      {/* Sections */}
      <div className="container mx-auto max-w-3xl px-4 py-16 pb-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-10"
        >
          {sections.map(({ icon: Icon, title, paragraphs }) => (
            <motion.section
              key={title}
              variants={itemVariants}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-primary/30 transition-colors duration-300 group-hover:bg-primary/60" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
              </div>

              <div className="mt-5 space-y-4">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>
      </div>
      {/* Contact */}
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65 }}
          className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full bg-primary/30" />

          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Get in Touch</h2>
          </div>

          <div className="space-y-4">
            <a
              href="mailto:LumberWiz.creations@gmail.com"
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/40"
            >
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">LumberWiz.creations@gmail.com</span>
            </a>

            <a
              href="https://instagram.com/lumberwiz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/40"
            >
              <Instagram className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">@lumberwiz</span>
            </a>

            <a
              href="https://wa.me/923005963639"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/40"
            >
              <MessageCircle className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">+923005963639</span>
            </a>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
