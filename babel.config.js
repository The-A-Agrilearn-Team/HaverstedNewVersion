module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      function replaceVariableDynamicImports({ types: t }) {
        return {
          visitor: {
            ImportExpression(path) {
              const source = path.node.source;
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