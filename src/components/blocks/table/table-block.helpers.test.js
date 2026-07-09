import { expect, test } from "vite-plus/test";
import { createCell, createCellValue, normalizeCell } from "./table-block.helpers.js";

test("creates table cells without global font weight", () => {
  expect(createCell()).toEqual({
    children: [],
    textAlign: "left",
    fontSize: "",
    fontFamily: "",
  });
});

test("normalizes table cells without legacy font weight conversion", () => {
  expect(
    normalizeCell({
      children: [{ text: "Header" }],
      textAlign: "center",
      fontWeight: "700",
      fontSize: "16px",
      fontFamily: "Inter",
    }),
  ).toEqual({
    children: [{ text: "Header" }],
    textAlign: "center",
    fontSize: "16px",
    fontFamily: "Inter",
  });
});

test("creates table cell values with inline bold marks", () => {
  expect(
    createCellValue({
      children: [{ text: "Body", marks: { bold: true } }],
      textAlign: "left",
      fontWeight: "700",
      fontSize: "",
      fontFamily: "",
    }),
  ).toEqual({
    children: [{ text: "Body", marks: { bold: true } }],
    textAlign: "left",
    fontSize: "",
    fontFamily: "",
  });
});
