import { expect, test, vi } from "vitest";
import "../features/index.js";
import { applyFormatCommand } from "./editor-commands.js";

test("does not apply commands when the active block capability is disabled", () => {
  const activeBlock = {
    align: vi.fn(),
    getSelectionFormat: () => ({ capabilities: { align: false } }),
    matches: () => false,
  };

  applyFormatCommand(activeBlock, { command: "alignCenter" }, vi.fn());

  expect(activeBlock.align).not.toHaveBeenCalled();
});

test("routes text alignment and font-family commands to text blocks", () => {
  const activeBlock = {
    align: vi.fn(),
    setFontFamily: vi.fn(),
    getSelectionFormat: () => ({ capabilities: {} }),
    matches: () => false,
  };

  applyFormatCommand(activeBlock, { command: "alignRight" }, vi.fn());
  applyFormatCommand(activeBlock, { command: "fontFamily", value: "serif" }, vi.fn());

  expect(activeBlock.align).toHaveBeenCalledWith("right");
  expect(activeBlock.setFontFamily).toHaveBeenCalledWith("serif");
});

test("applies media alignment as a property and notifies the toolbar", () => {
  const notifyToolbar = vi.fn();
  const activeBlock = {
    align: "",
    getSelectionFormat: () => ({ type: "image", align: "center" }),
    matches: (selector) => selector.includes("image-block"),
  };

  applyFormatCommand(activeBlock, { command: "alignCenter" }, notifyToolbar);

  expect(activeBlock.align).toBe("center");
  expect(notifyToolbar).toHaveBeenCalledWith({ type: "image", align: "center" });
});

test("notifies only when media style setters accept the command", () => {
  const notifyToolbar = vi.fn();
  const activeBlock = {
    getSelectionFormat: () => ({ type: "image", borderRadius: "8px" }),
    matches: (selector) => selector.includes("image-block"),
    setBorderRadius: vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true),
  };

  applyFormatCommand(activeBlock, { command: "borderRadius", value: "4px" }, notifyToolbar);
  applyFormatCommand(activeBlock, { command: "borderRadius", value: "8px" }, notifyToolbar);

  expect(activeBlock.setBorderRadius).toHaveBeenNthCalledWith(1, "4px");
  expect(activeBlock.setBorderRadius).toHaveBeenNthCalledWith(2, "8px");
  expect(notifyToolbar).toHaveBeenCalledTimes(1);
  expect(notifyToolbar).toHaveBeenCalledWith({ type: "image", borderRadius: "8px" });
});

test("toggles disabled state from the current selection format", () => {
  const notifyToolbar = vi.fn();
  let disabled = false;
  const activeBlock = {
    getSelectionFormat: () => ({ type: "button", disabled }),
    matches: (selector) => selector.includes("button-block"),
    setDisabled: vi.fn((nextDisabled) => {
      disabled = nextDisabled;
      return true;
    }),
  };

  applyFormatCommand(activeBlock, { command: "disabled" }, notifyToolbar);

  expect(activeBlock.setDisabled).toHaveBeenCalledWith(true);
  expect(notifyToolbar).toHaveBeenCalledWith({ type: "button", disabled: true });
});

test("falls back to selection formatting for inline commands", () => {
  const activeBlock = {
    formatSelection: vi.fn().mockReturnValue(true),
    getSelectionFormat: () => ({ capabilities: {} }),
    matches: () => false,
  };

  applyFormatCommand(activeBlock, { command: "bold", value: null }, vi.fn());

  expect(activeBlock.formatSelection).toHaveBeenCalledWith("bold", null);
});
