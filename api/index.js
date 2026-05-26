import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically resolve the server bundle from the dist/server directory
// which is included via vercel.json "includeFiles"
const serverPath = join(__dirname, "../dist/server/server.js");

let serverPromise;
async function getServer() {
  if (!serverPromise) {
    serverPromise = import(serverPath).then((m) => m.default ?? m);
  }
  return serverPromise;
}

export default async function handler(req, res) {
  const server = await getServer();

  // Convert Node.js IncomingMessage to Web Request
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const url = `${protocol}://${host}${req.url}`;

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
