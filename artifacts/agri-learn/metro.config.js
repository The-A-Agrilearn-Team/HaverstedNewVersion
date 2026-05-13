const { getDefaultConfig } = require("expo/metro-config");
const http = require("http");

const config = getDefaultConfig(__dirname);

// In a pnpm monorepo the workspace root has its own react@19.2.0 while
// agri-learn uses react@19.1.0 (via the catalog). Metro traverses symlinks
// across workspace boundaries and can bundle BOTH versions, causing the
// classic "Invalid hook call / Cannot read properties of null (reading
// 'useContext')" crash. Force every resolution of these packages to use
// the copy that lives in agri-learn's own node_modules.
const DEDUPE = [
  "react",
  "react-dom",
  "react-native",
  "react-native-web",
  "react-reconciler",
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const base = moduleName.split("/")[0];
  if (DEDUPE.includes(base)) {
    return {
      type: "sourceFile",
      filePath: require.resolve(moduleName, { paths: [__dirname] }),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Proxy /api/* from the Metro dev server (port 5000) to the Express API
// server (port 3000). The browser only sees port 5000 on Replit, so we
// need Metro to forward API calls internally.
config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      if (req.url && req.url.startsWith("/api/")) {
        const options = {
          hostname: "localhost",
          port: 3000,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, host: "localhost:3000" },
        };

        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        proxyReq.on("error", (err) => {
          console.warn("[metro-proxy] API server unreachable:", err.message);
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "API server unavailable" }));
        });

        req.pipe(proxyReq, { end: true });
      } else {
        middleware(req, res, next);
      }
    };
  },
};

module.exports = config;
