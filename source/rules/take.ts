/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { TSESTree as es } from "@typescript-eslint/experimental-utils";
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
      tk: "TK",
    },
    schema: [],
    type: "problem",
  },
  name: "take",
  create: (context) => {
    return {};
  },
});

export = rule;
