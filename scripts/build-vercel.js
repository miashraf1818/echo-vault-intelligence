#!/usr/bin/env node
// scripts/build-vercel.js
// Assembles the Vercel Build Output API v3 layout in .vercel/output/
import { cpSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const out = join(root, ".vercel", "output");

// 1. Static assets: dist/client → .vercel/output/static/
const staticDest = join(out, "static");
mkdirSync(staticDest, { recursive: true });
cpSync(join(root, "dist", "client"), staticDest, { recursive: true });
console.log("  ✓ Copied static assets");

// 2. SSR Serverless function: .vercel/output/functions/index.func/
const funcDir = join(out, "functions", "index.func");
mkdirSync(funcDir, { recursive: true });

// Copy the compiled SSR server bundle into the function directory
cpSync(join(root, "dist", "server"), join(funcDir, "dist", "server"), {
  recursive: true,
});
console.log("  ✓ Copied SSR server bundle");

// CRITICAL: Add package.json with "type":"module" so Node.js treats
// the function and dist/server/*.js files as ESM (they use import/export)
writeFileSync(
  join(funcDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2)
);

// Write the function entry point (bridges Node.js req/res → Web Fetch API)
writeFileSync(
  join(funcDir, "index.js"),
  `import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverPromise;
async function getServer() {
  if (!serverPromise) {
    serverPromise = import(join(__dirname, "dist", "server", "server.js")).then(
      (m) => m.default ?? m
    );
  }
  return serverPromise;
}

export default async function handler(req, res) {
  const server = await getServer();

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = \`\${protocol}://\${host}\${req.url}\`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, String(value));
      }
    }
  }

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }
  }

  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  try {
    const response = await server.fetch(webRequest);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });
    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error("[SSR Error]", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
`
);
console.log("  ✓ Wrote function entry point");

// .vc-config.json — Vercel Node.js function configuration
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
console.log("  ✓ Wrote .vc-config.json");

// 3. config.json — Vercel Build Output API v3 routing
// Static files in /static/ are served automatically.
// Everything else falls through to the /index function.
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Let Vercel serve static assets directly (they exist in /static/)
        { handle: "filesystem" },
        // Catch-all: route everything else to the SSR function
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2
  )
);
console.log("  ✓ Wrote config.json");

console.log("\n✅ Vercel Build Output v3 assembled at .vercel/output/");
