import { randomHash } from "../../../utils/ids.js";
import { registerList } from "../../../registries/list-registry.js";

export class BlockListGroup extends HTMLElement {
  static define(tagName, definition = {}) {
    const type = definition.type ?? tagName.replace(/-group$/, "");

    customElements.define(tagName, this);
    registerList({
      ...definition,
      type,
      tagName,
      selector: definition.selector ?? tagName,
    });

    return this;
  }

  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["min", "max"];
  }

  connectedCallback() {
    this.ensureBlockIds();
    this.ensureMinimumBlocks();
    this.syncPlaceholder();
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.ensureMinimumBlocks();
    this.syncPlaceholder();
  }

  get min() {
    return numberAttribute(this, "min", 1);
  }

  get max() {
    return numberAttribute(this, "max", 6);
  }

  get prefix() {
    return this.getAttribute("prefix") || "item";
  }

  get placeholder() {
    return this.getAttribute("placeholder") || "Item";
  }

  get itemLabel() {
    return this.getAttribute("item-label") || this.placeholder;
  }

  get blockTag() {
    return this.getAttribute("block-tag") || "button-block";
  }

  get blocks() {
    return [...this.querySelectorAll(`:scope > ${this.blockTag}`)];
  }

  setBlockData(blocks = []) {
    const limitedBlocks = [...blocks]
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .slice(0, this.max);
    this.replaceChildren();

    for (const [index, data] of limitedBlocks.entries()) {
      const block = this.createBlock(data.id || this.createId());
      block.placeholder = `${this.placeholder} ${index + 1}`;
      block.init?.({ ...data, id: block.blockId });
      this.append(block);
    }

    this.ensureMinimumBlocks();
    this.syncPlaceholder();
  }

  getFormat(activeBlock = null) {
    return {
      type: this.localName,
      label: this.itemLabel,
      count: this.blocks.length,
      min: this.min,
      max: this.max,
      canAdd: this.blocks.length < this.max,
      canDelete: this.blocks.length > this.min && this.blocks.includes(activeBlock),
      canSort: this.blocks.length > 1,
      items: this.blocks.map((block, index) => ({
        id: block.blockId,
        label: this.getBlockLabel(block, index),
        active: block === activeBlock,
      })),
    };
  }

  addBlock(afterBlock = null) {
    if (this.blocks.length >= this.max) return null;

    const sourceBlock = this.blocks.includes(afterBlock) ? afterBlock : this.blocks.at(-1);
    const block = this.createBlock(this.createId());

    this.placeholderElement?.remove();
    block.placeholder = `${this.placeholder} ${this.blocks.length + 1}`;
    block.init?.(
      sourceBlock?.toJSON
        ? this.cloneBlockData(sourceBlock.toJSON(), block.blockId)
        : this.createBlockData(block.blockId),
    );

    if (sourceBlock) {
      sourceBlock.after(block);
    } else {
      this.append(block);
    }
    this.syncPlaceholder();
    this.dispatchChange(block);
    return block;
  }

  deleteBlock(block) {
    if (!this.blocks.includes(block) || this.blocks.length <= this.min) return null;

    const nextBlock = block.nextElementSibling?.matches?.(this.blockTag)
      ? block.nextElementSibling
      : block.previousElementSibling?.matches?.(this.blockTag)
        ? block.previousElementSibling
        : null;

    block.remove();
    this.syncPlaceholder();
    this.dispatchChange(nextBlock);
    return nextBlock;
  }

  reorderBlocks(ids = [], activeBlock = null) {
    const blocksById = new Map(this.blocks.map((block) => [block.blockId, block]));
    const orderedBlocks = ids.map((id) => blocksById.get(id)).filter(Boolean);
    if (orderedBlocks.length !== this.blocks.length) return false;

    this.placeholderElement?.remove();
    for (const block of orderedBlocks) this.append(block);
    this.syncPlaceholder();
    this.dispatchChange(
      this.blocks.includes(activeBlock) ? activeBlock : (orderedBlocks[0] ?? null),
    );
    return true;
  }

  createBlock(id) {
    const block = document.createElement(this.blockTag);
    block.blockId = id;
    return block;
  }

  createBlockData(id) {
    return { id };
  }

  cloneBlockData(data, id) {
    return {
      ...data,
      id,
      text: "",
      link: "",
      target: "_self",
      tag: "button",
    };
  }

  getBlockLabel(block, index) {
    return block.text?.trim() || block.placeholder || `${this.itemLabel} ${index + 1}`;
  }

  ensureMinimumBlocks() {
    while (this.blocks.length < this.min) {
      const block = this.createBlock(this.createId());
      block.placeholder = `${this.placeholder} ${this.blocks.length + 1}`;
      block.init?.(this.createBlockData(block.blockId));
      this.append(block);
    }
    this.syncPlaceholder();
  }

  ensureBlockIds() {
    const ids = new Set();

    for (const block of this.blocks) {
      if (!block.blockId || ids.has(block.blockId)) {
        block.blockId = this.createId(ids);
      }
      ids.add(block.blockId);
    }
  }

  syncPlaceholder() {
    const placeholder = this.placeholderElement;
    if (this.blocks.length > 0 || this.min > 0) {
      placeholder?.remove();
      return;
    }

    if (placeholder) {
      placeholder.disabled = this.blocks.length >= this.max;
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "empty-placeholder";
    button.textContent = `Add ${this.itemLabel}`;
    button.disabled = this.blocks.length >= this.max;
    button.addEventListener("click", () => this.addBlock());
    this.append(button);
  }

  createId(existingIds = new Set()) {
    let id = randomHash();
    const ids = new Set([...this.blocks.map((block) => block.blockId), ...existingIds]);
    while (ids.has(id)) id = randomHash();
    return id;
  }

  dispatchChange(activeBlock) {
    this.dispatchEvent(
      new CustomEvent("block-group-change", {
        detail: { group: this, activeBlock },
        bubbles: true,
        composed: true,
      }),
    );
  }

  get placeholderElement() {
    return this.querySelector(":scope > .empty-placeholder");
  }
}

function numberAttribute(element, name, fallback) {
  const value = Number(element.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
}

BlockListGroup.define("block-list-group");
