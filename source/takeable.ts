/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-traits
 */

import { Trait, Traits } from "./traits";

export function takeable(traits: Traits, count: number): Trait {
  const { maxLength, minLength } = traits;
  if (maxLength >= count && minLength >= count) {
    return "true";
  }
  if (maxLength < count && minLength < count) {
    return "false";
  }
  return "boolean";
}
