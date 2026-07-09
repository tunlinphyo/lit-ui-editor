import { expect, test } from "vitest";
import { ENTER_ACTIONS, getEnterAction } from "./text-keyboard.js";

test("uses standard Enter behavior for paragraph rich text", () => {
  expect(getEnterAction()).toBe(ENTER_ACTIONS.paragraph);
  expect(getEnterAction({ shiftKey: true })).toBe(ENTER_ACTIONS.paragraph);
});

test("uses only Enter for inline-text line breaks", () => {
  expect(getEnterAction({ inlineText: true })).toBe(ENTER_ACTIONS.lineBreak);
  expect(getEnterAction({ inlineText: true, shiftKey: true })).toBe(ENTER_ACTIONS.unsupported);
});
