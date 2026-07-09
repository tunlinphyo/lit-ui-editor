import { expect, test } from "vite-plus/test";
import { isComposedDescendant } from "./editor-selection.js";

test("finds a block nested through a group shadow root", () => {
  const group = {};
  const shadowRoot = {
    parentNode: null,
    host: group,
    getRootNode() {
      return this;
    },
  };
  const block = { parentNode: shadowRoot };

  expect(isComposedDescendant(group, block)).toBe(true);
});

test("rejects a block belonging to another group", () => {
  const selectedGroup = {};
  const otherGroup = {};
  const otherShadowRoot = {
    parentNode: null,
    host: otherGroup,
    getRootNode() {
      return this;
    },
  };
  const block = { parentNode: otherShadowRoot };

  expect(isComposedDescendant(selectedGroup, block)).toBe(false);
});
