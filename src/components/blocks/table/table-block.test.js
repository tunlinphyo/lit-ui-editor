import { beforeEach, describe, expect, test, vi } from "vitest";
import "./table-block.js";

describe("table-block", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  test("adds and removes rows and columns while preserving valid dimensions", async () => {
    const block = await createTableBlock({
      cells: [
        [{ children: [{ text: "A1" }] }, { children: [{ text: "B1" }] }],
        [{ children: [{ text: "A2" }] }, { children: [{ text: "B2" }] }],
      ],
    });

    expect(block.addRow(1)).toBe(true);
    expect(block.addColumn(1)).toBe(true);
    expect(block.removeRow(10)).toBe(true);
    expect(block.removeColumn(10)).toBe(true);

    const json = block.toJSON();
    expect(json.cells).toHaveLength(2);
    expect(json.cells[0]).toHaveLength(2);
    expect(block.selectedAxis).toBe("column");
    expect(block.selectedIndex).toBe(1);
  });

  test("does not remove the final row or column", async () => {
    const block = await createTableBlock({ cells: [[{ children: [{ text: "Only" }] }]] });

    expect(block.removeRow(0)).toBe(false);
    expect(block.removeColumn(0)).toBe(false);

    expect(block.toJSON().cells).toHaveLength(1);
    expect(block.toJSON().cells[0]).toHaveLength(1);
  });

  test("sets optional column widths, defaulting unitless values to pixels", async () => {
    const block = await createTableBlock({
      cells: [[{ children: [{ text: "A" }] }, { children: [{ text: "B" }] }]],
    });

    expect(block.setColumnWidth(0, "120")).toBe(true);
    expect(block.setColumnWidth(1, "50%")).toBe(true);
    expect(block.setColumnWidth(1, "wide")).toBe(false);
    expect(block.toJSON().columnWidths).toEqual({ 0: "120px", 1: "50%" });

    block.addColumn(1);
    block.removeColumn(0);
    expect(block.toJSON().columnWidths).toEqual({ 1: "50%" });
  });

  test("toggles table options and cleans dependent border styles", async () => {
    const block = await createTableBlock({
      stripedRows: true,
      stripeBackgroundColor: "#f8fafc",
      borderWidth: "2px",
      borderColor: "#111827",
      borderStyle: "solid",
      borderPosition: "horizontal vertical",
    });
    const listener = vi.fn();
    block.addEventListener("editor-change", listener);

    expect(block.setHeaderRow(false)).toBe(true);
    expect(block.setHeaderColumn(true)).toBe(true);
    expect(block.setStripedRows(false)).toBe(true);
    expect(block.setBlockStyle("borderStyle", "none")).toBe(true);

    expect(block.toJSON()).toMatchObject({
      headerRow: false,
      headerColumn: true,
      stripedRows: false,
      stripeBackgroundColor: null,
      borderWidth: "",
      borderColor: "",
      borderStyle: "none",
      borderPosition: "",
    });
    expect(listener).toHaveBeenCalledTimes(4);
  });

  test("rejects invalid table border positions", async () => {
    const block = await createTableBlock({ borderPosition: "horizontal vertical" });

    expect(block.setBlockStyle("borderPosition", "diagonal")).toBe(false);
    expect(block.setBlockStyle("borderPosition", "vertical horizontal")).toBe(true);

    expect(block.toJSON()).toMatchObject({
      borderPosition: "horizontal vertical",
    });
  });
});

async function createTableBlock(options = {}) {
  const block = document.createElement("table-block");
  document.body.append(block);
  block.init(options);
  await block.updateComplete;
  return block;
}
