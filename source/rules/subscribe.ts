/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { TSESTree as es } from "@typescript-eslint/experimental-utils";
import {
  getParserServices,
  getTypeServices,
  isIdentifier,
  isLiteral,
} from "eslint-etc";
import { getObservableTraits, Traits } from "../traits";
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
      // TODO: Make 'will' replaceable with 'might' once options are
      // implemented. Use 'sure' and 'unsure' in the configuration to control
      // whether or not certainty is required before reporting failures.
      complete:
        "The complete handler will not be called; the subscribed observable will not complete.",
      next:
        "The next handler will not be called; the subscribed observable will not next.",
    },
    schema: [],
    type: "problem",
  },
  name: "subscribe",
  create: (context) => {
    const { esTreeNodeToTSNodeMap, program } = getParserServices(context);
    const { couldBeFunction, getType } = getTypeServices(context);
    const typeChecker = program.getTypeChecker();

    function checkCallbacks(
      traits: Traits,
      next: es.Node | undefined,
      error: es.Node | undefined,
      complete: es.Node | undefined,
      reportNode: es.Node
    ) {
      if (next && isDefined(next)) {
        checkNext(traits, reportNode);
      }
      if (complete && isDefined(complete)) {
        checkComplete(traits, reportNode);
      }
    }

    function checkComplete(traits: Traits, reportNode: es.Node) {
      const failure = "false"; // TODO: options
      if (traits.complete === failure) {
        context.report({
          messageId: "complete",
          node: reportNode,
        });
      }
    }

    function checkNext(traits: Traits, reportNode: es.Node) {
      // TODO: options; minLength === 0
      if (traits.maxLength === 0) {
        context.report({
          messageId: "next",
          node: reportNode,
        });
      }
    }

    function checkObserver(
      traits: Traits,
      observer: es.Node,
      reportNode: es.Node
    ) {
      const type = getType(observer);
      if (!type) {
        return;
      }
      const properties = typeChecker.getPropertiesOfType(type);
      if (properties.some(({ name }) => name === "next")) {
        checkNext(traits, reportNode);
      }
      if (properties.some(({ name }) => name === "complete")) {
        checkComplete(traits, reportNode);
      }
    }

    function isDefined(node: es.Node) {
      if (isIdentifier(node) && node.name === "undefined") {
        return false;
      }
      if (isLiteral(node) && node.value === null) {
        return false;
      }
      return true;
    }

    return {
      "CallExpression[callee.property.name='subscribe']": (
        callExpression: es.CallExpression
      ) => {
        const { callee } = callExpression;
        const { object, property } = callee as es.MemberExpression;
        const traits = getObservableTraits(
          esTreeNodeToTSNodeMap.get(object),
          typeChecker
        );
        if (!traits) {
          return;
        }
        const args = callExpression.arguments;
        if (args.length === 0) {
          return;
        }
        if (args.length === 1) {
          const [arg] = args;
          if (couldBeFunction(arg)) {
            checkCallbacks(traits, arg, undefined, undefined, property);
          } else {
            checkObserver(traits, arg, property);
          }
        } else {
          const [next, error, complete] = args;
          checkCallbacks(traits, next, error, complete, property);
        }
      },
    };
  },
});

export = rule;
