/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { TSESTree as es } from "@typescript-eslint/experimental-utils";
import { getParserServices } from "eslint-etc";
import { takeable } from "../takeable";
import { getOperatorTraits, Traits } from "../traits";
import { ruleCreator } from "../utils";

const rule = ruleCreator({
  defaultOptions: [],
  meta: {
    docs: {
      category: "Best Practices",
      description: "TK",
      recommended: false,
    },
    fixable: undefined,
    messages: {
      complete: "The observable will not complete.",
      length: "Fewer elements than specified will be taken.",
    },
    schema: [],
    type: "problem",
  },
  name: "take",
  create: (context) => {
    const { esTreeNodeToTSNodeMap, program } = getParserServices(context);
    const typeChecker = program.getTypeChecker();

    function checkComplete(output: Traits, callee: es.Node) {
      const failure = "false"; // TODO: options
      if (output.complete === failure) {
        context.report({
          messageId: "complete",
          node: callee,
        });
      }
    }

    function checkLength(input: Traits, arg: es.Node, callee: es.Node) {
      const failure = "false"; // TODO: options
      if (takeable(input, toCount(arg)) === failure) {
        context.report({
          messageId: "length",
          node: callee,
        });
      }
    }

    function toCount(arg: es.Node): number {
      const type = typeChecker.getTypeAtLocation(
        esTreeNodeToTSNodeMap.get(arg)
      );
      const text = typeChecker.typeToString(type);
      const count = parseInt(text, 10);
      return Number.isNaN(count) ? Infinity : count;
    }

    return {
      "CallExpression[callee.name='take']": (
        callExpression: es.CallExpression
      ) => {
        const { input, output } = getOperatorTraits(
          esTreeNodeToTSNodeMap.get(callExpression),
          typeChecker
        );
        if (!input || !output) {
          return;
        }
        const { callee } = callExpression;
        const [arg] = callExpression.arguments;
        checkComplete(output, callee);
        checkLength(input, arg, callee);
      },
    };
  },
});

export = rule;
