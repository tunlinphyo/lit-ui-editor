import { beforeEach, describe, expect, test, vi } from "vitest";
import { FEATURES } from "../../../registries/formatter-registry.js";
import "./image-block.js";

describe("image-block", () => {
  beforeEach(() => {
    document.body.replaceChildren();
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function showModal() {
        this.open = true;
      };
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function close() {
        this.open = false;
      };
    }
  });

  test("normalizes object fit and serializes image styles", async () => {
    const block = await createImageBlock({
      id: "image-1",
      src: "/hero.png",
      alt: "Hero",
      objectFit: "invalid",
      align: "right",
      link: "/hero",
      target: "_blank",
      backgroundColor: "#f8fafc",
      borderRadius: "16px",
    });

    expect(block.toJSON()).toMatchObject({
      id: "image-1",
      src: "/hero.png",
      alt: "Hero",
      objectFit: "none",
      align: "right",
      link: "/hero",
      target: "_blank",
      backgroundColor: "#f8fafc",
      borderRadius: "16px",
      type: "image",
    });
  });

  test("applies image style setters and keeps cleared border JSON clean", async () => {
    const block = await createImageBlock({
      borderWidth: "2px",
      borderColor: "#334155",
      borderStyle: "solid",
      borderPosition: "left",
      link: "/image",
      target: "_blank",
    });

    expect(block.setObjectFit("cover")).toBe(true);
    expect(block.setObjectFit("stretch")).toBe(false);
    expect(block.setBorderRadius("8px")).toBe(true);
    expect(block.setBlockStyle("borderStyle", "none")).toBe(true);
    expect(block.setBlockStyle("fontSize", "20px")).toBe(false);
    expect(block.setImageLink("")).toBe(true);

    expect(block.toJSON()).toMatchObject({
      objectFit: "cover",
      borderRadius: "8px",
      borderWidth: "",
      borderColor: "",
      borderStyle: "none",
      borderPosition: "",
      link: "",
      target: "_self",
    });
  });

  test("opens picker with callback and serializes selected image", async () => {
    const block = await createImageBlock({ id: "image-picker" });
    const listener = vi.fn((event) => {
      event.detail.setImages([{ url: "/selected.png", name: "Selected image" }]);
    });
    block.addEventListener("image-picker-open", listener);

    block.renderRoot.querySelector(".picker").click();
    await block.updateComplete;

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({ id: "image-picker", block }),
      }),
    );
    block.renderRoot.querySelector(".image-option").click();
    await block.updateComplete;

    expect(block.toJSON()).toMatchObject({
      src: "/selected.png",
      alt: "Selected image",
    });
  });

  test("reports restricted capabilities and disabled state", async () => {
    const block = await createImageBlock({
      disabled: true,
      features: [FEATURES.imageUpload, FEATURES.objectFit],
    });

    const format = block.getSelectionFormat();

    expect(format).toMatchObject({
      disabled: true,
      type: "image",
    });
    expect(format.capabilities[FEATURES.imageUpload]).toBe(true);
    expect(format.capabilities[FEATURES.objectFit]).toBe(true);
    expect(format.capabilities[FEATURES.link]).toBe(false);
  });
});

async function createImageBlock(options = {}) {
  const block = document.createElement("image-block");
  document.body.append(block);
  block.init(options);
  await block.updateComplete;
  return block;
}
