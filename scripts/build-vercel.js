#!/usr/bin/env node
// scripts/build-vercel.js
// Assembles the Vercel Build Output API v3 layout in .vercel/output/
import { cpSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, ".vercel", "output");

// 1. Static assets: dist/client/assets → .vercel/output/static/assets
const staticDest = join(out, "static");
mkdirSync(staticDest, { recursive: true });
cpSync(join(root, "dist", "client"), staticDest, { recursive: true });

// 2. Serverless function: .vercel/output/functions/index.func/
const funcDir = join(out, "functions", "index.func");
mkdirSync(funcDir, { recursive: true });

// Bundle the SSR server files into the function directory
cpSync(join(root, "dist", "server"), join(funcDir, "dist", "server"), {
  recursive: true,
});

// Write the function entry point
writeFileSync(
  join(funcDir, "index.js"),
  `
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, "dist", "server", "server.js");

let serverPromise;
async function getServer() {
  if (!serverPromise) {
    serverPromise = import(serverPath).then((m) => m.default ?? m);
  }
  return serverPromise;
}

export default async function handler(req, res) {
  const server = await getServer();

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const url = \`\${protocol}://\${host}\${req.url}\`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? new ReadableStream({
          start(controller) {
            req.on("data", (chunk) => controller.enqueue(chunk));
            req.on("end", () => controller.close());
            req.on("error", (err) => controller.error(err));
          },
        })
      : undefined;

  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body,
    duplex: body ? "half" : undefined,
  });

  const response = await server.fetch(webRequest);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const buffer = await response.arrayBuffer();
  res.end(Buffer.from(buffer));
}
`
);

// .vc-config.json — tells Vercel this is a Node.js function
writeFileSync(
  join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.js",
      launcherType: "Nodejs",
    },
    null,
    2
  )
);

// 3. config.json — routes: serve static assets, fall back to SSR function
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Serve static assets directly from /static/assets/
        {
          src: "/assets/(.+)",
          dest: "/assets/$1",
          headers: { "Cache-Control": "public, max-age=31536000, immutable" },
        },
        // Everything else → SSR function
        {
          src: "/(.*)",
          dest: "/index",
        },
      ],
    },
    null,
    2
  )
);

console.log("✅ Vercel Build Output v3 assembled at .vercel/output/");
