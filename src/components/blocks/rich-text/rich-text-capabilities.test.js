import { expect, test } from "vite-plus/test";
import { FEATURES } from "../../../registries/formatter-registry.js";
import { resolveSupportedFeatures } from "../text/text-capabilities.js";
import { PARAGRAPH_RICH_TEXT_FEATURES } from "./rich-text-capabilities.js";

test("paragraph rich text supports current text formatters except element type", () => {
  expect(PARAGRAPH_RICH_TEXT_FEATURES).not.toContain(FEATURES.type);
  expect(PARAGRAPH_RICH_TEXT_FEATURES).toEqual(
    expect.arrayContaining([
      FEATURES.fontFamily,
      FEATURES.fontSize,
      FEATURES.color,
      FEATURES.bold,
      FEATURES.italic,
      FEATURES.underline,
      FEATURES.orderedList,
      FEATURES.unorderedList,
      FEATURES.align,
      FEATURES.backgroundColor,
      FEATURES.link,
      FEATURES.linkTarget,
    ]),
  );
});

test("configured features cannot enable unsupported component capabilities", () => {
  expect(resolveSupportedFeatures("type,bold,fontSize", PARAGRAPH_RICH_TEXT_FEATURES)).toEqual([
    FEATURES.bold,
    FEATURES.fontSize,
  ]);
});
