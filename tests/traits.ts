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
import { getObservableTraits, getOperatorTraits } from "../source/traits";

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

describe("getObservableTraits", () => {
  it("should return an observable's traits", () => {
    const { program, sourceFile } = compile(stripIndent`
      import { Observable } from "rxjs-traits";
      let source: Observable<number, {
        async: true;
        complete: true;
        error: false;
        max: [number];
        min: [];
      };
    `);
    const [source] = tsquery(sourceFile, `Identifier[text="source"]`) as [
      ts.Identifier
    ];
    expect(source, "no source").to.exist;
    const traits = getObservableTraits(source, program.getTypeChecker());
    expect(traits, "no traits").to.exist;
    expect(traits).to.deep.equal({
      async: "true",
      complete: "true",
      error: "false",
      maxLength: 1,
      minLength: 0,
    });
  });

  it("should return a composed observable's traits", () => {
    const { program, sourceFile } = compile(stripIndent`
      import { of } from "rxjs-traits";
      import { filter } from "rxjs-traits/operators";
      const source = of(1, 2, 3).pipe(filter(value => value > 10));
    `);
    const [source] = tsquery(sourceFile, `Identifier[text="source"]`) as [
      ts.Identifier
    ];
    expect(source, "no source").to.exist;
    const traits = getObservableTraits(source, program.getTypeChecker());
    expect(traits, "no traits").to.exist;
    expect(traits).to.deep.equal({
      async: "false",
      complete: "true",
      error: "false",
      maxLength: 3,
      minLength: 0,
    });
  });

  it("should return an observable's traits with rest elements", () => {
    const { program, sourceFile } = compile(stripIndent`
      import { Observable } from "rxjs-traits";
      let source: Observable<number, {
        async: true;
        complete: true;
        error: false;
        max: [string, ...number[]];
        min: [];
      };
    `);
    const [source] = tsquery(sourceFile, `Identifier[text="source"]`) as [
      ts.Identifier
    ];
    expect(source, "no source").to.exist;
    const traits = getObservableTraits(source, program.getTypeChecker());
    expect(traits, "no traits").to.exist;
    expect(traits).to.deep.equal({
      async: "true",
      complete: "true",
      error: "false",
      maxLength: Infinity,
      minLength: 0,
    });
  });

  it("should return a composed observable's traits with rest elements", () => {
    const { program, sourceFile } = compile(stripIndent`
      import { interval } from "rxjs-traits";
      import { startWith } from "rxjs-traits/operators";
      const source = interval(1e3).pipe(startWith("beginning"));
    `);
    const [source] = tsquery(sourceFile, `Identifier[text="source"]`) as [
      ts.Identifier
    ];
    expect(source, "no source").to.exist;
    const traits = getObservableTraits(source, program.getTypeChecker());
    expect(traits, "no traits").to.exist;
    expect(traits).to.deep.equal({
      async: "true",
      complete: "false",
      error: "false",
      maxLength: Infinity,
      minLength: Infinity,
    });
  });
});

describe("getOperatorTraits", () => {
  it("should return an operator's traits", () => {
    const { program, sourceFile } = compile(stripIndent`
      import { of } from "rxjs-traits";
      import { filter } from "rxjs-traits/operators";
      const source = of(1, 2, 3).pipe(filter(value => value > 10));
    `);
    const [operator] = tsquery(
      sourceFile,
      `CallExpression[expression.text="filter"]`
    ) as [ts.CallExpression];
    expect(operator, "no operator").to.exist;
    const result = getOperatorTraits(operator, program.getTypeChecker());
    expect(result, "no result").to.exist;
    expect(result).to.deep.equal({
      input: {
        async: "false",
        complete: "true",
        error: "false",
        maxLength: 3,
        minLength: 3,
      },
      output: {
        async: "false",
        complete: "true",
        error: "false",
        maxLength: 3,
        minLength: 0,
      },
    });
  });
});
