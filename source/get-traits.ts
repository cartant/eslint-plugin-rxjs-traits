/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import * as ts from "typescript";

type Traits = {
  async: string;
  complete: string;
  error: string;
  max: string;
  min: string;
};

export function getTraits(
  node: ts.Identifier,
  typeChecker: ts.TypeChecker
): Traits | undefined {
  const nodeType = typeChecker.getTypeAtLocation(node);
  const nodeTypeArguments =
    nodeType.aliasTypeArguments || (nodeType as any).typeArguments;
  const nodeTraits = nodeTypeArguments?.[1];
  if (!nodeTraits) {
    return undefined;
  }
  const traits = {};
  const properties = typeChecker.getPropertiesOfType(nodeTraits);
  for (const property of properties) {
    const { name } = property;
    const [declaration] = property.getDeclarations() || [];
    if (declaration) {
      const type = typeChecker.getTypeAtLocation(declaration);
      let text = typeChecker.typeToString(type);
      if (text === "A") {
        const typeArguments = (property as any).type
          .resolvedTypeArguments as ts.Type[];
        text = `[${typeArguments
          .map((type) => typeChecker.typeToString(type))
          .join(", ")}]`;
      }
      traits[property.name] = text;
    }
  }
  return traits as Traits;
}
