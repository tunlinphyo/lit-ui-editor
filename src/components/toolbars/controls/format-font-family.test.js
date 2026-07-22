import { expect, test, vi } from "vitest";
import { FormatFontFamily } from "./format-font-family.js";

test("reapplies the displayed font family", async () => {
  const control = new FormatFontFamily();
  document.body.append(control);
  await control.updateComplete;
  control.value = "var(--font-body)";
  const onCommand = vi.fn();
  control.addEventListener("format-command", onCommand);

  control.applyValue("var(--font-body)");

  expect(onCommand).toHaveBeenCalledOnce();
  expect(onCommand.mock.calls[0][0].detail).toEqual({
    command: "fontFamily",
    value: "var(--font-body)",
  });
  control.remove();
});
