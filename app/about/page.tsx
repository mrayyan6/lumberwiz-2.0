"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold text-primary-foreground md:text-5xl"
          >
            About LumberWiz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-primary-foreground/80 text-lg"
          >
            Where ancient craft meets contemporary design
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-20 max-w-3xl">
        {/* Brand Story */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-foreground">Our Story</h2>
          <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              LumberWiz was born from a deep reverence for the art of terracotta — a material that has shaped human civilization for millennia. Our journey began with a simple observation: the most beautiful spaces are those that carry a sense of soul, of hands that shaped them, of earth that gave them form.
            </p>
            <p>
              We partner with master artisans whose families have practiced the craft for generations. Each piece in our collection carries the imprint of this heritage — the subtle irregularities of hand-thrown clay, the warmth of natural earth tones, the quiet confidence of timeless design.
            </p>
          </div>
        </motion.section>

        {/* Craftsmanship */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-foreground">Craftsmanship</h2>
          <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Every LumberWiz piece begins as raw clay, carefully selected for its mineral composition and workability. Our artisans shape each item by hand, using techniques refined over centuries — coiling, throwing, and sculpting with an intimacy that no machine can replicate.
            </p>
            <p>
              The firing process is where transformation happens. In traditional kilns heated to precise temperatures, clay becomes terracotta — strong, porous, and alive with warmth. Our planters breathe with your plants. Our lamps cast light through forms that tell stories. Our vases hold both flowers and the weight of tradition.
            </p>
            <p>
              From desktop planters that bring nature to your workspace, to statement vases that anchor a room, to terracotta and marble lamps that create atmosphere — every product is a testament to the beauty of handmade objects in a mass-produced world.
            </p>
          </div>
        </motion.section>

        {/* Vision */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-foreground">Our Vision</h2>
          <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We envision a world where the objects we live with carry meaning — where a planter on your desk connects you to the earth, where a lamp in your living room carries the warmth of a craftsman&apos;s hands, where beauty and purpose are inseparable.
            </p>
            <p>
              LumberWiz exists to bridge the gap between artisanal heritage and modern living. We curate pieces that are at once rooted in tradition and perfectly at home in contemporary spaces. Our commitment is to sustainability, fair craft, and the enduring belief that handmade objects elevate everyday life.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
