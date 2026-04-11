// One-time upload script — node scripts/upload.js
// Reads all 5 product JSON files, uploads images to Supabase Storage,
// and upserts every product row into the products table.
//
// Products with a matching local image → in_inventory=true, image_url=public URL
// Products without a local image       → in_inventory=false, image_url=null

require("dotenv").config({ path: ".env.local" });

const fs   = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET     = "product-images";
const IMAGES_DIR = path.join(__dirname, "..", "public", "images");
const CONCURRENCY = 5;

const JSON_FILES = [
  { file: "planters.json",        category: "Terracotta Planters" },
  { file: "vases.json",           category: "Terracotta Vase"     },
  { file: "lamps.json",           category: "Terracotta Lamps"    },
  { file: "marble-lamps.json",    category: "Marble Lamps"        },
  { file: "desktop-planters.json",category: "Desktop Planters"    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Run an array of async tasks with at most `limit` running at once. */
async function pLimit(tasks, limit) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ── Per-product logic ─────────────────────────────────────────────────────────

async function processProduct(product, category, stats) {
  const serial    = product.id;           // JSON `id` → DB `serial`
  const imagePath = product.image_path;   // e.g. "/images/Lamps (1).jpeg" or null

  let imageUrl  = "";
  let inInventory = false;

  if (imagePath) {
    const filename  = path.basename(imagePath);          // e.g. "Lamps (1).jpeg"
    const ext       = path.extname(filename).slice(1);   // e.g. "jpeg"
    const localPath = path.join(IMAGES_DIR, filename);
    const storagePath = `${serial}.${ext}`;              // e.g. "LA-CL-EG-001.jpeg"

    if (fs.existsSync(localPath)) {
      // Upload to Supabase Storage
      const fileBuffer = fs.readFileSync(localPath);
      const mimeType   = `image/${ext === "jpg" ? "jpeg" : ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

      if (uploadErr) {
        console.error(`  [ERROR] ${serial} — storage upload failed: ${uploadErr.message}`);
        stats.errors++;
        return;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
      imageUrl    = urlData.publicUrl;
      inInventory = true;
    } else {
      // image_path listed in JSON but file missing locally
      console.warn(`  [WARN]  ${serial} — local file not found (${filename}) — marked out of inventory`);
      stats.noImage++;
    }
  } else {
    // No image_path in JSON at all
    console.warn(`  [WARN]  ${serial} — ${product.name} — no image — marked out of inventory`);
    stats.noImage++;
  }

  // Upsert row into products table
  const row = {
    serial,
    name:         product.name,
    price:        10000,
    description:  product.description || "",
    category,
    in_inventory: inInventory,
    image_url:    imageUrl,
  };

  const { error: upsertErr } = await supabase
    .from("products")
    .upsert(row, { onConflict: "serial" });

  if (upsertErr) {
    console.error(`  [ERROR] ${serial} — db upsert failed: ${upsertErr.message}`);
    stats.errors++;
    return;
  }

  if (inInventory) {
    console.log(`  [OK]    ${serial} — ${product.name}`);
    stats.withImage++;
  } else {
    stats.noImage; // already incremented above
    console.log(`  [OK]    ${serial} — ${product.name} (no image, out of inventory)`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting upload…\n");

  const stats = { total: 0, withImage: 0, noImage: 0, errors: 0 };
  const allTasks = [];

  for (const { file, category } of JSON_FILES) {
    const jsonPath = path.join(__dirname, "..", "data", "products", file);
    const products = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(`Queued ${products.length} products from ${file}`);
    stats.total += products.length;
    for (const product of products) {
      allTasks.push(() => processProduct(product, category, stats));
    }
  }

  console.log(`\nUploading ${stats.total} products (concurrency: ${CONCURRENCY})…\n`);
  await pLimit(allTasks, CONCURRENCY);

  console.log("\n─── Summary ───────────────────────────────────");
  console.log(`Total products processed : ${stats.total}`);
  console.log(`Inserted with image      : ${stats.withImage}`);
  console.log(`Inserted without image   : ${stats.noImage}`);
  console.log(`Errors                   : ${stats.errors}`);
  console.log("───────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
