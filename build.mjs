import { cp, mkdir } from "node:fs/promises";
// Optional export for hosts that require a dist directory. GitHub Pages needs no build.
await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "fonts.css",
  "app.js",
  ".nojekyll",
]) {
  await cp(file, `dist/${file}`);
}
await cp("assets", "dist/assets", { recursive: true });
console.log("Static export ready in dist/.");
