/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import * as ts from "typescript";

export type Trait = "true" | "false" | "boolean";
export type Traits = {
  async: Trait;
  complete: Trait;
  error: Trait;
  maxLength: number;
  minLength: number;
};

export function getObservableTraits(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): Traits | undefined {
  const type = typeChecker.getTypeAtLocation(node);
  return getTypeTraits(type, typeChecker);
}

export function getOperatorTraits(
  callExpression: ts.CallExpression,
  typeChecker: ts.TypeChecker
): { input?: Traits; output?: Traits } {
  const signature = typeChecker.getResolvedSignature(callExpression);
  if (!signature) {
    return { input: undefined, output: undefined };
  }
  const returnType = typeChecker.getReturnTypeOfSignature(signature);
  if (returnType.aliasTypeArguments?.length !== 2) {
    return { input: undefined, output: undefined };
  }
  return {
    input: getTypeTraits(returnType.aliasTypeArguments[0], typeChecker),
    output: getTypeTraits(returnType.aliasTypeArguments[1], typeChecker),
  };
}

function getTypeTraits(
  type: ts.Type,
  typeChecker: ts.TypeChecker
): Traits | undefined {
  if (!isTypeReference(type)) {
    return undefined;
  }
  const typeArguments = typeChecker.getTypeArguments(type);
  const traitsType = typeArguments[1];
  if (!traitsType) {
    return undefined;
  }
  const traits: Record<string, unknown> = {};
  const properties = typeChecker.getPropertiesOfType(traitsType);
  for (const property of properties) {
    const type = typeChecker.getTypeOfSymbolAtLocation(
      property,
      property.valueDeclaration
    );
    const { name } = property;
    if (name === "max" || name === "min") {
      const elements = toElements(type, typeChecker);
      traits[`${name}Length`] = elements ? elements.length : Infinity;
    } else {
      traits[name] = typeChecker.typeToString(type);
    }
  }
  return traits as Traits;
}

function isTypeReference(type: ts.Type): type is ts.TypeReference {
  return Boolean((type as any).target);
}

function toElements(
  type: ts.Type,
  typeChecker: ts.TypeChecker
): string[] | undefined {
  let typeArguments: ts.Type[] | undefined = (type as any)
    .resolvedTypeArguments;
  if (typeArguments) {
    const target = (type as any).target;
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
