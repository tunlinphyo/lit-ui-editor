import { expect, test } from "vitest";
import { registerBlock } from "../registries/block-registry.js";
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

test("accepts an app-registered block type", () => {
  registerBlock({
    type: "merchant-benefits",
    selector: "merchant-benefits-block",
    text: false,
    formattable: false,
  });

  expect(
    validatePage(
      createPage({
        id: "benefits",
        type: "merchant-benefits",
      }),
    ),
  ).toEqual([]);
});
