import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const base =
  process.argv.find((arg) => arg.startsWith("--base="))?.slice(7) || "/";
if (!base.startsWith("/") || !base.endsWith("/"))
  throw new Error("Base must start and end with /.");
const publicFiles = new Set([
  "index.html",
  "styles.css",
  "fonts.css",
  "app.js",
  ".nojekyll",
]);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
};
http
  .createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      if (!pathname.startsWith(base)) throw new Error("Not found");
      const relative = pathname.slice(base.length) || "index.html";
      if (
        !publicFiles.has(relative) &&
        !/^assets\/[a-zA-Z0-9_.-]+$/.test(relative)
      )
        throw new Error("Not found");
      const data = await readFile(path.join(root, relative));
      response.writeHead(200, {
        "Content-Type":
          types[path.extname(relative)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(data);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Local: http://127.0.0.1:${port}${base}`),
  );
