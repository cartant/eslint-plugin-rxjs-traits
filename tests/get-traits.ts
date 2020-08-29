/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */
/* eslint no-unused-expressions: 0 */

import { tsquery } from "@phenomnomnominal/tsquery";
import { expect } from "chai";
import { stripIndent } from "common-tags";
import { Compiler } from "ts-snippet";
import * as ts from "typescript";
import { getTraits } from "../source/get-traits";

function compile(code: string, options: ts.CompilerOptions = {}) {
  const compiler = new Compiler({
    moduleResolution: "node",
    target: "esnext",
    ...options,
  });
  const program = compiler.compile({
    "snippet.ts": code,
  });
  const sourceFile = program.getSourceFile("snippet.ts");
  if (!sourceFile) {
    throw new Error("Cannot find source file for snippet.");
  }
  return {
    program,
    sourceFile,
  };
}

describe("getTraits", () => {
  it("should return an observable's traits", () => {
    const { program, sourceFile } = compile(stripIndent`
      import { of } from "rxjs-traits";
      import { filter } from "rxjs-traits/operators";
      const source = of(1, 2, 3).pipe(filter(value => value > 10));
    `);
    const [source] = tsquery(sourceFile, `Identifier[name="source"]`) as [
      ts.Identifier
    ];
    expect(source, "no source").to.exist;
    const traits = getTraits(source, program.getTypeChecker());
    expect(traits, "no traits").to.exist;
    expect(traits).to.have.property("async", "false");
    expect(traits).to.have.property("complete", "true");
    expect(traits).to.have.property("error", "false");
    expect(traits).to.have.property("max", "[number, number, number]");
    expect(traits).to.have.property("min", "[]");
  });
});
