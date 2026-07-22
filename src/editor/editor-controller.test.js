import { expect, test } from "vitest";
import { shouldPreserveToolbarSelection } from "./editor-controller.js";

function element(localName) {
  return { localName };
}

test("preserves toolbar selection for font, link, and text color controls", () => {
  expect(
    shouldPreserveToolbarSelection([element("format-font-family"), element("format-toolbar")]),
  ).toBe(true);
  expect(shouldPreserveToolbarSelection([element("format-link"), element("format-toolbar")])).toBe(
    true,
  );
  expect(
    shouldPreserveToolbarSelection([element("format-text-color"), element("format-toolbar")]),
  ).toBe(true);
  expect(
    shouldPreserveToolbarSelection([
      element("format-text-color-palette"),
      element("format-toolbar"),
    ]),
  ).toBe(true);
});

test("does not preserve toolbar selection for unrelated elements", () => {
  expect(shouldPreserveToolbarSelection([element("button"), element("format-toolbar")])).toBe(
    false,
  );
});
