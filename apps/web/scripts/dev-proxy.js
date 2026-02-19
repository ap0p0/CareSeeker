/**
 * Dev proxy: routes subdomains to different Vite dev servers.
 * Usage: node scripts/dev-proxy.js (run after starting all 4 Vite servers)
 *
 * localhost:3000         → core   (port 3001)
 * client.localhost:3000  → client (port 3002)
 * provider.localhost:3000→ provider (port 3003)
 * admin.localhost:3000   → admin  (port 3004)
 */

import http from "node:http";
import httpProxy from "http-proxy";

const PORTS = {
  core: 3001,
  client: 3002,
  provider: 3003,
  admin: 3004,
};

const HOST_MAP = {
  localhost: "core",
  "127.0.0.1": "core",
  "client.localhost": "client",
  "provider.localhost": "provider",
  "admin.localhost": "admin",
};

const proxy = httpProxy.createProxyServer({});

proxy.on("error", (err, req, res) => {
  console.error("[proxy]", err.message);
  if (res && !res.headersSent && typeof res.writeHead === "function") {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Proxy error – ensure all Vite servers are running.");
  }
});

const server = http.createServer((req, res) => {
  const host = req.headers.host?.split(":")[0] ?? "localhost";
  const target = HOST_MAP[host] ?? "core";
  const port = PORTS[target];
  proxy.web(req, res, { target: `http://127.0.0.1:${port}` });
});

server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host?.split(":")[0] ?? "localhost";
  const target = HOST_MAP[host] ?? "core";
  const port = PORTS[target];
  proxy.ws(req, socket, head, { target: `http://127.0.0.1:${port}` });
});

server.listen(3000, () => {
  console.log("\n  Dev proxy on http://localhost:3000");
  console.log("  → localhost:3000           (core)");
  console.log("  → client.localhost:3000    (client)");
  console.log("  → provider.localhost:3000  (provider)");
  console.log("  → admin.localhost:3000     (admin)\n");
});
