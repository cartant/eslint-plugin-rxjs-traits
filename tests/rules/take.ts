/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/take");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("take", rule, {
  valid: [],
  invalid: [],
});
