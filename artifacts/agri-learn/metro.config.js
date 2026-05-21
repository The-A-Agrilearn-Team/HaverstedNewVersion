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

// @opentelemetry packages use dynamic import() with variable expressions
// which Metro bundler cannot resolve at build time. Stub them out with
// an empty module so the Supabase optional telemetry path is a no-op.
const STUB_PREFIXES = ["@opentelemetry/"];

const EMPTY_MODULE = path.resolve(__dirname, "stubs/empty-module.js");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Stub out any OpenTelemetry package
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
