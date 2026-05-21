const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// In a pnpm monorepo the workspace root has its own react@19.2.0 while
// agri-learn uses react@19.1.0 (via the catalog). Metro traverses symlinks
// across workspace boundaries and can bundle BOTH versions, causing the
// classic "Invalid hook call / Cannot read properties of null (reading
// 'useContext')" crash. Force every resolution of these packages to use
// the copy that lives in agri-learn's own node_modules.
//
// react-native-screens: root has 4.23.0, agri-learn has 4.16.0. Without
// deduplication Metro may bundle 4.23.0 for some imports while native
// binary expects 4.16.0, causing NavigationContent context errors.
const DEDUPE = [
  "react",
  "react-dom",
  "react-native",
  "react-native-web",
  "react-reconciler",
  "react-native-screens",
  "@react-navigation/core",
  "@react-navigation/native",
  "@react-navigation/bottom-tabs",
  "@react-navigation/elements",
];

// Packages that contain Node.js-only code and must be stubbed for Hermes/RN.
// - @opentelemetry/*: optional telemetry in @supabase/supabase-js (variable dynamic imports)
// - ws / bufferutil / utf-8-validate: Node.js WebSocket used by @supabase/realtime-js
// - node:* built-ins that ws transitively requires (net, tls, fs, etc.)
const STUB_EXACT = new Set([
  "ws",
  "bufferutil",
  "utf-8-validate",
  // Node built-ins that ws / realtime pulls in
  "net",
  "tls",
  "fs",
  "http",
  "https",
  "zlib",
  "stream",
  "crypto",
  "os",
  "path",
  "url",
  "util",
  "events",
  "assert",
  "buffer",
  "querystring",
  "string_decoder",
  "timers",
  "child_process",
  "cluster",
  "dgram",
  "dns",
  "domain",
  "module",
  "perf_hooks",
  "process",
  "readline",
  "repl",
  "tty",
  "v8",
  "vm",
  "worker_threads",
]);

// Prefix-based stubs (any module starting with these strings)
const STUB_PREFIXES = [
  "@opentelemetry/",
  "node:",  // node:fs, node:crypto, node:stream, etc.
];

const EMPTY_MODULE = path.resolve(__dirname, "stubs/empty-module.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Stub out exact module names
  if (STUB_EXACT.has(moduleName)) {
    return { type: "sourceFile", filePath: EMPTY_MODULE };
  }

  // Stub out prefix-matched modules
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
    } catch {
      // fall through to default resolution if not found locally
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
