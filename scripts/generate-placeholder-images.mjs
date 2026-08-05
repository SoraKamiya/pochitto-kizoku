// One-off generator for placeholder menu images. Run with `node scripts/generate-placeholder-images.mjs`.
// Swap these SVGs for real photos in public/images/ whenever you have them —
// nothing else in the app needs to change since imageUrl paths stay the same.
import { writeFileSync, mkdirSync } from "fs";
import { MENU } from "../src/data/menu.js";

const CATEGORY_COLORS = {
  焼き鳥: "#8c3a2b",
  サイドメニュー: "#b9772e",
  ドリンク: "#2f6b52",
  デザート: "#a5478f",
};

mkdirSync(new URL("../public/images", import.meta.url), { recursive: true });

for (const item of MENU) {
  const slug = item.imageUrl.replace("/images/", "").replace(".svg", "");
  const color = CATEGORY_COLORS[item.category] ?? "#555555";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
  <rect width="320" height="240" fill="${color}" />
  <rect x="8" y="8" width="304" height="224" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" />
  <text x="160" y="128" font-family="'Hiragino Sans', 'Noto Sans JP', sans-serif" font-size="28" fill="#fff" text-anchor="middle">${item.name}</text>
</svg>`;
  writeFileSync(new URL(`../public/images/${slug}.svg`, import.meta.url), svg);
}

console.log(`Generated ${MENU.length} placeholder images in public/images/`);
