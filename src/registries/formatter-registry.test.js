import { expect, test } from "vitest";
import { FEATURES, getCapabilities } from "./formatter-registry.js";

test("icon defaults match the dedicated icon toolbar controls", () => {
  const capabilities = getCapabilities("icon");

  expect(capabilities).toMatchObject({
    [FEATURES.fontSize]: true,
    [FEATURES.color]: true,
    [FEATURES.backgroundColor]: true,
    [FEATURES.border]: true,
    [FEATURES.borderRadius]: true,
    [FEATURES.link]: true,
    [FEATURES.linkTarget]: true,
    [FEATURES.disabled]: true,
  });
  expect(capabilities[FEATURES.align]).toBe(false);
});
