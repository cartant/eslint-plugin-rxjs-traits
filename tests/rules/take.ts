/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/take");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("take", rule, {
  valid: [
    {
      code: stripIndent`
        // takeable with literal
        import { of } from "rxjs-traits";
        import { take } from "rxjs-traits/operators";
        const result = of(1, 2, 3).pipe(take(1));
      `,
    },
    {
      code: stripIndent`
        // takeable with number
        import { of } from "rxjs-traits";
        import { take } from "rxjs-traits/operators";
        const count: number = 1;
        const result = of(1, 2, 3).pipe(take(count));
      `,
    },
  ],
  invalid: [
    fromFixture(stripIndent`
      // not takeable
      import { of } from "rxjs-traits";
      import { take } from "rxjs-traits/operators";
      const result = of(1).pipe(take(2));
                                ~~~~ [length]
    `),
    fromFixture(stripIndent`
      // won't complete; not takeable
      import { NEVER } from "rxjs-traits";
      import { take } from "rxjs-traits/operators";
      const result = NEVER.pipe(take(1));
                                ~~~~ [complete]
                                ~~~~ [length]
    `),
  ],
});
