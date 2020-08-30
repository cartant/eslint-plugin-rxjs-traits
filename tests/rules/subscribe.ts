/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/subscribe");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("subscribe", rule, {
  valid: [
    {
      code: stripIndent`
        // will next; arrow function
        import { of } from "rxjs-traits";
        of(1, 2, 3).subscribe(value => console.log(value));
      `,
    },
    {
      code: stripIndent`
        // will next; non-arrow function
        import { of } from "rxjs-traits";
        of(1, 2, 3).subscribe(function (value) { console.log(value); });
      `,
    },
    {
      code: stripIndent`
        // will next; function identifier
        import { of } from "rxjs-traits";
        const next = (value) => console.log(value);
        of(1, 2, 3).subscribe(next);
      `,
    },
    {
      code: stripIndent`
        // will complete; arrow function
        import { of } from "rxjs-traits";
        of(1, 2, 3).subscribe(undefined, undefined, () => console.log("complete"));
      `,
    },
    {
      code: stripIndent`
        // will complete; non-arrow function
        import { of } from "rxjs-traits";
        of(1, 2, 3).subscribe(undefined, undefined, function () { console.log("complete"); });
      `,
    },
    {
      code: stripIndent`
        // will complete; function identifier
        import { of } from "rxjs-traits";
        const complete = () => console.log("complete");
        of(1, 2, 3).subscribe(undefined, undefined, complete);
      `,
    },
    {
      code: stripIndent`
        // will next/complete; observer
        import { of } from "rxjs-traits";
        of(1, 2, 3).subscribe({
          next(value) { console.log(value); },
          complete() { console.log("complete"); }
        });
      `,
    },
  ],
  invalid: [
    fromFixture(stripIndent`
      // will not next; arrow function
      import { EMPTY } from "rxjs-traits";
      EMPTY.subscribe(value => console.log(value));
            ~~~~~~~~~ [next]
    `),
    fromFixture(stripIndent`
      // will not next; non-arrow function
      import { EMPTY } from "rxjs-traits";
      EMPTY.subscribe(function (value) { console.log(value); });
            ~~~~~~~~~ [next]
    `),
    fromFixture(stripIndent`
      // will not next; function identifier
      import { EMPTY } from "rxjs-traits";
      const next = (value) => console.log(value);
      EMPTY.subscribe(next);
            ~~~~~~~~~ [next]
    `),
    fromFixture(stripIndent`
      // will not complete; arrow function
      import { NEVER } from "rxjs-traits";
      NEVER.subscribe(undefined, undefined, () => console.log("complete"));
            ~~~~~~~~~ [complete]
    `),
    fromFixture(stripIndent`
      // will not complete; non-arrow function
      import { NEVER } from "rxjs-traits";
      NEVER.subscribe(undefined, undefined, function () { console.log("complete"); });
            ~~~~~~~~~ [complete]
    `),
    fromFixture(stripIndent`
      // will not complete; function identifier
      import { NEVER } from "rxjs-traits";
      const complete = () => console.log("complete");
      NEVER.subscribe(undefined, undefined, complete);
            ~~~~~~~~~ [complete]
    `),
    fromFixture(stripIndent`
      // will not next/complete; observer
      import { NEVER } from "rxjs-traits";
      NEVER.subscribe({
            ~~~~~~~~~ [next]
            ~~~~~~~~~ [complete]
        next(value) { console.log(value); },
        complete() { console.log("complete"); }
      });
    `),
  ],
});
