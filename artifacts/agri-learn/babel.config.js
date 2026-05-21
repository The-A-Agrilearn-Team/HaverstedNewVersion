module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      // Hermes (React Native's JS engine) cannot compile dynamic import()
      // calls where the specifier is a runtime variable — e.g.:
      //   import(/* @vite-ignore */ OTEL_PKG).catch(...)
      // This pattern comes from @supabase/supabase-js's optional OpenTelemetry
      // support. Replace any import(Identifier) with Promise.resolve({}) so
      // the optional telemetry path becomes a harmless no-op at runtime.
      function replaceVariableDynamicImports({ types: t }) {
        return {
          visitor: {
            ImportExpression(path) {
              const source = path.node.source;
              // Only transform non-literal sources (variables/identifiers).
              // String literals like import("./foo") are fine and left alone.
              if (
                source.type !== "StringLiteral" &&
                source.type !== "TemplateLiteral"
              ) {
                path.replaceWith(
                  t.callExpression(
                    t.memberExpression(
                      t.identifier("Promise"),
                      t.identifier("resolve")
                    ),
                    [t.objectExpression([])]
                  )
                );
              }
            },
          },
        };
      },
    ],
  };
};
