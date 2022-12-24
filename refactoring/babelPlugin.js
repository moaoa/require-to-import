module.exports = function (babel) {
  const { types: t } = babel;

  const isRequireStatement = (varDeclaration) => {
    if (
      varDeclaration.init &&
      varDeclaration.init.type === "CallExpression" &&
      varDeclaration.init.callee.name === "require"
    )
      return true;
    else return false;
  };

  return {
    visitor: {
      // search for VariableDeclaration
      VariableDeclaration(path) {
        const declaration = path.node.declarations[0];

        const isRequire = isRequireStatement(declaration);

        if (!isRequire) return;
        // const x = require('y')
        const importIdentifier = t.identifier(declaration.id.name);
        const importSpecifier = t.importDefaultSpecifier(importIdentifier);

        const packageName = declaration.init.arguments[0].value;

        const mainProgram = path.findParent((parent) => parent.isProgram());
        // add to our program

        mainProgram.node.body.unshift(
          t.importDeclaration([importSpecifier], t.stringLiteral(packageName))
        );
        path.remove(); // remove the old require statement
      },
    },
  };
};
