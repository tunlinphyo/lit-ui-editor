import { beforeEach, describe, expect, test } from "vitest";
import { FEATURES } from "../../../registries/formatter-registry.js";
import "./button-block.js";

describe("button-block", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  test("serializes button and nested icon formatting", async () => {
    const block = await createButtonBlock({
      id: "button-1",
      text: "Buy now",
      icon: "shopping_cart",
      iconPosition: "end",
      iconFontSize: "24px",
      iconColor: "#111827",
      iconBackgroundColor: "#f8fafc",
      iconBorderWidth: "2px",
      iconBorderColor: "#94a3b8",
      iconBorderStyle: "solid",
      iconBorderPosition: "left",
      iconBorderRadius: "8px",
      iconDisabled: true,
      color: "#ffffff",
      backgroundColor: "#2563eb",
      borderRadius: "12px",
      link: "/checkout",
      target: "_blank",
      align: "center",
    });

    expect(block.toJSON()).toMatchObject({
      id: "button-1",
      text: "Buy now",
      icon: "shopping_cart",
      iconPosition: "end",
      iconFontSize: "24px",
      iconColor: "#111827",
      iconBackgroundColor: "#f8fafc",
      iconBorderWidth: "2px",
      iconBorderColor: "#94a3b8",
      iconBorderStyle: "solid",
      iconBorderPosition: "left",
      iconBorderRadius: "8px",
      iconDisabled: true,
      color: "#ffffff",
      backgroundColor: "#2563eb",
      borderRadius: "12px",
      link: "/checkout",
      target: "_blank",
      tag: "a",
      align: "center",
      type: "button",
    });
  });

  test("applies formatter commands and cleans dependent button styles", async () => {
    const block = await createButtonBlock({
      borderWidth: "2px",
      borderColor: "#111827",
      borderStyle: "solid",
      borderPosition: "top left",
      link: "/docs",
      target: "_blank",
    });

    expect(block.formatSelection("foreColor", "#ef4444")).toBe(true);
    expect(block.formatSelection("fontSize", "24px")).toBe(false);
    expect(block.setBlockStyle("borderColor", "")).toBe(true);
    expect(block.setBlockStyle("unknown", "x")).toBe(false);
    expect(block.setButtonLink("")).toBe(true);

    expect(block.toJSON()).toMatchObject({
      color: "#ef4444",
      borderWidth: "",
      borderColor: "",
      borderStyle: "",
      borderPosition: "top left",
      link: "",
      target: "_self",
      tag: "button",
    });
  });

  test("normalizes icon placement and disabled selection format", async () => {
    const block = await createButtonBlock({
      icon: "favorite",
      features: [FEATURES.color, FEATURES.disabled],
    });

    expect(block.setButtonIconPlacement("end")).toBe(true);
    expect(block.setButtonIconPlacement("middle")).toBe(false);
    expect(block.setDisabled(1)).toBe(true);

    const format = block.getSelectionFormat();
    expect(format).toMatchObject({
      buttonIconPlacement: "end",
      disabled: true,
      type: "button",
    });
    expect(format.capabilities[FEATURES.color]).toBe(true);
    expect(format.capabilities[FEATURES.disabled]).toBe(true);
    expect(format.capabilities[FEATURES.link]).toBe(false);

    expect(block.setButtonIconPlacement("none")).toBe(true);
    await block.updateComplete;

    expect(block.toJSON()).toMatchObject({
      icon: "",
      iconPosition: "none",
      disabled: true,
    });
  });

  test("rejects invalid link targets and preserves current target", async () => {
    const block = await createButtonBlock({ link: "/docs", target: "_blank" });

    expect(block.setButtonLinkTarget("_parent")).toBe(false);
    expect(block.setButtonLinkTarget("_self")).toBe(true);

    expect(block.toJSON()).toMatchObject({
      link: "/docs",
      target: "_self",
    });
  });
});

async function createButtonBlock(options = {}) {
  const block = document.createElement("button-block");
  document.body.append(block);
  block.init(options);
  await block.updateComplete;
  await block.updateComplete;
  return block;
}
