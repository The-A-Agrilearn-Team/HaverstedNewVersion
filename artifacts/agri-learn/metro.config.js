const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

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

module.exports = config;
