import { kMaxLength } from "buffer";
/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { expect } from "chai";
import { takeable } from "../source/takeable";

describe("takeable", () => {
  it("should return true if takeable", () => {
    const result = takeable(
      {
        async: "boolean",
        complete: "boolean",
        error: "boolean",
        maxLength: 2,
        minLength: 2,
      },
      1
    );
    expect(result).to.equal("true");
  });

  it("should return false if not takeable", () => {
    const result = takeable(
      {
        async: "boolean",
        complete: "boolean",
        error: "boolean",
        maxLength: 1,
        minLength: 1,
      },
      2
    );
    expect(result).to.equal("false");
  });

  it("should return boolean if unknown", () => {
    const result = takeable(
      {
        async: "boolean",
        complete: "boolean",
        error: "boolean",
        maxLength: 2,
        minLength: 0,
      },
      1
    );
    expect(result).to.equal("boolean");
  });
});
