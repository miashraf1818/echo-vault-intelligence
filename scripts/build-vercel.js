#!/usr/bin/env node
// scripts/build-vercel.js
// Assembles the Vercel Build Output API v3 layout in .vercel/output/
//
// The Cloudflare plugin is kept ENABLED during build, which produces a fully
// self-contained server bundle (~738 kB) that includes ALL npm dependencies.
// This bundle runs fine in Node.js 18+ since it only uses the Web Fetch API
// (Request/Response/Headers), which Node.js 18 has built-in.

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
//    The Cloudflare build outputs a fully self-contained bundle at:
//      dist/server/index.js             (0.1 kB thin entry)
//      dist/server/assets/worker-entry-*.js  (21 kB)
//      dist/server/assets/server-*.js        (738 kB - fully bundled with all deps!)
const funcDir = join(out, "functions", "index.func");
mkdirSync(funcDir, { recursive: true });

// Copy the entire dist/server (includes all bundled assets)
cpSync(join(root, "dist", "server"), join(funcDir, "dist", "server"), {
  recursive: true,
});
console.log("  ✓ Copied fully-bundled SSR server");

// CRITICAL: ESM package.json so Node.js treats .js files as ES modules
writeFileSync(
  join(funcDir, "package.json"),
  JSON.stringify({ type: "module" }, null, 2)
);

// Function entry: bridges Node.js (req/res) → Web Fetch API → Cloudflare-style server handler
// Node.js 18+ has built-in Request/Response/Headers, so the Cloudflare bundle runs natively.
writeFileSync(
  join(funcDir, "index.js"),
  `import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dist/server/index.js is the Cloudflare-built entry (re-exports the fetch handler)
// It imports from ./dist/server/assets/worker-entry-*.js which is fully bundled.
let serverPromise;
async function getServer() {
  if (!serverPromise) {
    serverPromise = import(join(__dirname, "dist", "server", "index.js")).then(
      (m) => m.default ?? m
    );
  }
  return serverPromise;
}

export default async function handler(req, res) {
  try {
    const server = await getServer();

    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const url = \`\${protocol}://\${host}\${req.url}\`;

    const webHeaders = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => webHeaders.append(key, v));
        } else {
          webHeaders.set(key, String(value));
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
      headers: webHeaders,
      body,
    });

    // Cloudflare Workers-style: fetch(request, env, executionContext)
    const response = await server.fetch(webRequest, {}, {
      waitUntil: () => {},
      passThroughOnException: () => {},
    });

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });

    const buffer = await response.arrayBuffer();
    res.end(Buffer.from(buffer));
  } catch (err) {
    console.error("[SSR Function Error]", err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html");
    res.end(\`<html><body><h1>Server Error</h1><pre>\${String(err)}</pre></body></html>\`);
  }
}
`
);
console.log("  ✓ Wrote function entry point (uses fully-bundled Cloudflare output)");

// .vc-config.json — Vercel Node.js 20 function config
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
writeFileSync(
  join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Serve static files (JS/CSS bundles in /static/assets/) directly from CDN
        { handle: "filesystem" },
        // All other requests → SSR function
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2
  )
);
console.log("  ✓ Wrote config.json");

console.log("\n✅ Vercel Build Output v3 assembled at .vercel/output/");
