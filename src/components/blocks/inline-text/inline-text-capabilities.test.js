import { expect, test } from "vitest";
import { FEATURES } from "../../../registries/formatter-registry.js";
import { resolveSupportedFeatures } from "../text/text-capabilities.js";
import { INLINE_TEXT_FEATURES } from "./inline-text-capabilities.js";

test("inline text exposes only its requested capabilities", () => {
  expect(INLINE_TEXT_FEATURES).toEqual([
    FEATURES.type,
    FEATURES.fontFamily,
    FEATURES.fontSize,
    FEATURES.color,
    FEATURES.bold,
    FEATURES.italic,
    FEATURES.underline,
    FEATURES.align,
    FEATURES.link,
  ]);
});

test("inline text cannot enable unsupported capabilities", () => {
  expect(
    resolveSupportedFeatures(
      "type,fontFamily,fontSize,color,bold,linkTarget",
      INLINE_TEXT_FEATURES,
    ),
  ).toEqual([FEATURES.type, FEATURES.fontFamily, FEATURES.fontSize, FEATURES.color, FEATURES.bold]);
});
