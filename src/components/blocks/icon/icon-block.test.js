import { beforeEach, describe, expect, test, vi } from "vitest";
import { FEATURES } from "../../../registries/formatter-registry.js";
import "./icon-block.js";

describe("icon-block", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  test("applies icon formatter commands and emits selection changes", async () => {
    const block = await createIconBlock({ id: "icon-1", icon: "star" });
    const listener = vi.fn();
    block.addEventListener("selection-format-change", listener);

    expect(block.formatSelection("fontSize", "32px")).toBe(true);
    expect(block.formatSelection("foreColor", "#2563eb")).toBe(true);
    expect(block.formatSelection("backgroundColor", "#e0f2fe")).toBe(true);
    expect(block.formatSelection("link", "/icons")).toBe(true);
    expect(block.formatSelection("bold")).toBe(false);

    expect(block.toJSON()).toMatchObject({
      id: "icon-1",
      icon: "star",
      fontSize: "32px",
      color: "#2563eb",
      backgroundColor: "#e0f2fe",
      link: "/icons",
      target: "_self",
      type: "icon",
    });
    expect(listener).toHaveBeenCalledTimes(4);
  });

  test("cleans border styles and resets target when link is removed", async () => {
    const block = await createIconBlock({
      link: "/icons",
      target: "_blank",
      borderWidth: "2px",
      borderColor: "#111827",
      borderStyle: "solid",
      borderPosition: "top right",
    });

    expect(block.setBlockStyle("borderStyle", "none")).toBe(true);
    expect(block.setBlockStyle("backgroundColor", "#fff")).toBe(false);
    expect(block.setIconLink("")).toBe(true);
    expect(block.setIconLinkTarget("_parent")).toBe(false);

    expect(block.toJSON()).toMatchObject({
      borderWidth: "",
      borderColor: "",
      borderStyle: "none",
      borderPosition: "",
      link: "",
      target: "_self",
    });
  });

  test("reports restricted capabilities and disabled state", async () => {
    const block = await createIconBlock({
      disabled: true,
      features: [FEATURES.fontSize, FEATURES.color],
    });

    const format = block.getSelectionFormat();

    expect(format).toMatchObject({
      disabled: true,
      type: "icon",
    });
    expect(format.capabilities[FEATURES.fontSize]).toBe(true);
    expect(format.capabilities[FEATURES.color]).toBe(true);
    expect(format.capabilities[FEATURES.link]).toBe(false);
  });
});

async function createIconBlock(options = {}) {
  const block = document.createElement("icon-block");
  document.body.append(block);
  block.init(options);
  await block.updateComplete;
  return block;
}
