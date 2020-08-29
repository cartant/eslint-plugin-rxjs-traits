/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import * as ts from "typescript";

type Boolean = "true" | "false" | "boolean";
type Traits = {
  async: Boolean;
  complete: Boolean;
  error: Boolean;
  maxLength: number;
  minLength: number;
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
    const [declaration] = property.getDeclarations() || [];
    if (declaration) {
      const { name } = property;
      const type = typeChecker.getTypeAtLocation(declaration);
      if (name === "max" || name === "min") {
        const elements = toElements(property, type, typeChecker);
        traits[`${name}Length`] = elements ? elements.length : Infinity;
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
): string[] | undefined {
  const elementsType: ts.Type = (property as any).type || type;
  let typeArguments: ts.Type[] | undefined = (elementsType as any)
    .resolvedTypeArguments;
  if (typeArguments) {
    const target = (elementsType as any).target;
    return target?.hasRestElement
      ? undefined
      : typeArguments.map((typeArgument) =>
          typeChecker.typeToString(typeArgument)
        );
  }
  const text = typeChecker.typeToString(type);
  if (text === "[]") {
    return [];
  }
  return undefined;
}
