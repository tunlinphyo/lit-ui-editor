import { expect, test } from "vite-plus/test";
import { validatePage } from "./page-validators.js";

function createPage(block) {
  return {
    version: 1,
    groups: [
      {
        id: "group",
        type: "test",
        sort: 0,
        style: {},
        blocks: [block],
      },
    ],
  };
}

test("accepts serialized inline text with a separate element type", () => {
  const errors = validatePage(
    createPage({
      id: "title",
      type: "inline-text",
      elementType: "h2",
      children: [{ text: "Title" }],
    }),
  );

  expect(errors).toEqual([]);
});

test("rejects inline text without a supported element type", () => {
  const errors = validatePage(
    createPage({
      id: "title",
      type: "inline-text",
      children: [{ text: "Title" }],
    }),
  );

  expect(errors).toContain("groups[0].blocks[0].elementType must be p, h1, h2, or h3");
});
