// Generate a 1200x630 Modern Warm OG placeholder.
// Run: pnpm -F landing gen:og
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/og/purrai-og.jpg");
await mkdir(path.dirname(OUT), { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#EDE8E1"/>
  <text x="600" y="310" font-family="Playfair Display, serif" font-size="120"
        font-weight="600" text-anchor="middle" fill="#1F1A17">Purr&#xB7;AI</text>
  <text x="600" y="400" font-family="Inter, sans-serif" font-size="32"
        text-anchor="middle" fill="#1F1A17">Hear every purr, rumble, and breath.</text>
  <rect x="100" y="500" width="1000" height="4" fill="#C65D3E"/>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(OUT);
console.log("wrote", OUT);
