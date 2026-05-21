const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const DEDUPE = [
  "react", "react-dom", "react-native", "react-native-web",
  "react-reconciler", "react-native-screens",
  "@react-navigation/core", "@react-navigation/native",
  "@react-navigation/bottom-tabs", "@react-navigation/elements",
];

const STUB_EXACT = new Set([
  "ws", "bufferutil", "utf-8-validate",
  "net", "tls", "fs", "http", "https", "zlib", "stream",
  "crypto", "os", "path", "url", "util", "events", "assert",
  "buffer", "querystring", "string_decoder", "timers",
  "child_process", "cluster", "dgram", "dns", "domain",
  "module", "perf_hooks", "process", "readline", "repl",
  "tty", "v8", "vm", "worker_threads",
]);

const STUB_PREFIXES = ["@opentelemetry/", "node:"];

const EMPTY_MODULE = path.resolve(__dirname, "stubs/empty-module.js");

// KEY FIX: removes "module" so Metro picks the CJS build of supabase
// instead of the ESM build that contains import(OTEL_PKG)
config.resolver.mainFields = ["react-native", "browser", "main"];

// Ensure only root babel.config.js is used (no per-package .babelrc overrides)
config.transformer.enableBabelRCLookup = false;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (STUB_EXACT.has(moduleName)) {
    return { type: "sourceFile", filePath: EMPTY_MODULE };
  }
  if (STUB_PREFIXES.some((prefix) => moduleName.startsWith(prefix))) {
    return { type: "sourceFile", filePath: EMPTY_MODULE };
  }
  const base = moduleName.split("/")[0];
  const scopedBase = moduleName.startsWith("@")
    ? moduleName.split("/").slice(0, 2).join("/")
    : base;
  if (DEDUPE.includes(base) || DEDUPE.includes(scopedBase)) {
    try {
      return {
        type: "sourceFile",
        filePath: require.resolve(moduleName, { paths: [__dirname] }),
      };
    } catch {}
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;