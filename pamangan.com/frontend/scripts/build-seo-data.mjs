// Runs before `npm run build` (prebuild). Writes public/seo-data.json, which
// seo.php and sitemap.php on the server use for page titles, descriptions,
// the sitemap and structured data. Single sources: src/data/seo-pages.json
// (pages + FAQ) and src/data/business.js (business info + menu).
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = JSON.parse(readFileSync(join(root, "src/data/seo-pages.json"), "utf8"));

// business.js is an ES module without imports; load a temporary .mjs copy
const tmp = mkdtempSync(join(tmpdir(), "pamangan-seo-"));
const copy = join(tmp, "business.mjs");
writeFileSync(copy, readFileSync(join(root, "src/data/business.js"), "utf8"));
const biz = await import(pathToFileURL(copy).href);
rmSync(tmp, { recursive: true, force: true });

const site = pages.site.url.replace(/\/$/, "");
const abs = (src) => (src ? (src.startsWith("http") ? src : `${site}${src}`) : null);

const data = {
  ...pages,
  business: {
    name: biz.BUSINESS.name,
    tagline: biz.BUSINESS.tagline,
    phone: biz.BUSINESS.phoneE164,
    facebook: biz.BUSINESS.facebookUrl,
    areas: biz.BUSINESS.deliveryAreas,
  },
  menu: biz.ACTIVE_MENU.map((m) => ({
    name: m.name,
    description: m.description,
    category: m.category,
    serving: m.serving,
    price: m.price,
    image: abs(m.image),
  })),
  generated: new Date().toISOString(),
};

writeFileSync(join(root, "public/seo-data.json"), JSON.stringify(data));
console.log(`seo-data.json: ${Object.keys(data.pages).length} pages, ${data.menu.length} menu items`);
