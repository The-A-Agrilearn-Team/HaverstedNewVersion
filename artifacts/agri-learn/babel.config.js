module.exports = function (api) {
  api.cache(false); // disabled — stale cache skips the import(variable) fix
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      function replaceVariableDynamicImports({ types: t }) {
        return {
          visitor: {
            ImportExpression(nodePath) {
              const source = nodePath.node.source;
              if (
                source.type !== "StringLiteral" &&
                source.type !== "TemplateLiteral"
              ) {
                nodePath.replaceWith(
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