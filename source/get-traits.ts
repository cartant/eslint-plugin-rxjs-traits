/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import * as ts from "typescript";

type Boolean = "true" | "false" | "boolean";
type Elements = string[] | undefined;
type Traits = {
  async: Boolean;
  complete: Boolean;
  error: Boolean;
  max: Elements;
  min: Elements;
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
  const traits: Record<string, unknown> = {};
  const properties = typeChecker.getPropertiesOfType(nodeTraits);
  for (const property of properties) {
    const { name } = property;
    const [declaration] = property.getDeclarations() || [];
    if (declaration) {
      const { name } = property;
      const type = typeChecker.getTypeAtLocation(declaration);
      if (name === "max" || name === "min") {
        traits[name] = toElements(property, type, typeChecker);
      } else {
        traits[name] = typeChecker.typeToString(type);
      }
    }
  }
  return traits as Traits;
}

function toElements(
  property: ts.Symbol,
  type: ts.Type,
  typeChecker: ts.TypeChecker
): Elements {
  const typeArguments: ts.Type[] | undefined =
    (type as any)?.resolvedTypeArguments ||
    (property as any)?.type?.resolvedTypeArguments;
  if (typeArguments) {
    return typeArguments.map((typeArgument) =>
      typeChecker.typeToString(typeArgument)
    );
  }
  const text = typeChecker.typeToString(type);
  if (text === "[]") {
    return [];
  }
  return undefined;
}
