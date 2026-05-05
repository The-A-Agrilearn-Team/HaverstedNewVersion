const { getDefaultConfig } = require("expo/metro-config");
const { createProxyMiddleware } = require("http-proxy-middleware");

const config = getDefaultConfig(__dirname);

config.server = {
  enhanceMiddleware: (metroMiddleware) => {
    const apiProxy = createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: false,
      on: {
        error: (err, _req, res) => {
          console.warn("[proxy] API server unreachable:", err.message);
          if (res && "writeHead" in res) {
            res.writeHead(502, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "API server unreachable" }));
          }
        },
      },
    });

    return (req, res, next) => {
      if (req.url && req.url.startsWith("/api/")) {
        return apiProxy(req, res, next);
      }
      return metroMiddleware(req, res, next);
    };
  },
};

module.exports = config;
