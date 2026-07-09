import { expect, test } from "vitest";
import { DEFAULT_GROUP_STYLE } from "./page-defaults.js";
import { normalizePage, normalizePageGroups } from "./page-normalize.js";

test("normalizes groups with omitted style before strict validation", () => {
  expect(
    normalizePage({
      version: 1,
      groups: [
        {
          id: "example",
          type: "about",
          sort: 1,
          blocks: [],
        },
      ],
    }),
  ).toEqual({
    version: 1,
    groups: [
      {
        id: "example",
        type: "about",
        hashId: "",
        sort: 1,
        style: DEFAULT_GROUP_STYLE,
        blocks: [],
      },
    ],
  });
});

test("normalizes groups with partial style", () => {
  const groups = normalizePageGroups({
    version: 1,
    groups: [
      {
        id: "example",
        type: "about",
        sort: 0,
        style: { backgroundColor: "#FEF0F4" },
        blocks: [],
      },
    ],
  });

  expect(groups[0].style).toEqual({
    ...DEFAULT_GROUP_STYLE,
    backgroundColor: "#FEF0F4",
  });
});

test("still rejects explicitly invalid group style", () => {
  expect(() =>
    normalizePage({
      version: 1,
      groups: [
        {
          id: "example",
          type: "about",
          sort: 0,
          style: null,
          blocks: [],
        },
      ],
    }),
  ).toThrow("groups[0].style must be an object");
});
