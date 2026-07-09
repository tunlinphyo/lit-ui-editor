import { randomHash } from "../../../utils/ids.js";
import { registerList } from "../../../registries/list-registry.js";

export class GroupListBase extends HTMLElement {
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

  static itemTag = "";
  static itemType = "";
  static itemClass = null;
  static defaultMin = 1;
  static defaultMax = 6;
  static defaultPrefix = "item";
  static defaultPlaceholder = "Item";
  static defaultSortLabelBlock = "title";

  static get observedAttributes() {
    return ["min", "max"];
  }

  connectedCallback() {
    this.#assertConfiguration();
    this.ensureItemIds();
    this.ensureMinimumItems();
    this.syncPlaceholder();
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    this.ensureMinimumItems();
    this.syncPlaceholder();
  }

  get itemTag() {
    return this.constructor.itemTag;
  }

  get itemType() {
    return this.constructor.itemType;
  }

  get itemClass() {
    return this.constructor.itemClass;
  }

  get min() {
    return numberAttribute(this, "min", this.constructor.defaultMin);
  }

  get max() {
    return numberAttribute(this, "max", this.constructor.defaultMax);
  }

  get prefix() {
    return this.getAttribute("prefix") || this.constructor.defaultPrefix;
  }

  get placeholder() {
    return this.getAttribute("placeholder") || this.constructor.defaultPlaceholder;
  }

  get itemLabel() {
    return this.getAttribute("item-label") || this.placeholder;
  }

  get sortLabelBlock() {
    return this.getAttribute("sort-label-block") || this.constructor.defaultSortLabelBlock;
  }

  get blocks() {
    return [...this.querySelectorAll(`:scope > ${this.itemTag}`)];
  }

  setBlockData(items = []) {
    const limitedItems = [...items]
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .slice(0, this.max);
    const ids = new Set();
    this.replaceChildren();

    for (const [index, data] of limitedItems.entries()) {
      const id = data.id && !ids.has(data.id) ? data.id : this.createId(ids);
      ids.add(id);

      const item = this.createItem(id);
      item.init?.({ ...data, id });
      item.setAttribute("aria-label", `${this.placeholder} ${index + 1}`);
      this.append(item);
    }

    this.ensureMinimumItems();
    this.syncPlaceholder();
  }

  getFormat(activeBlock = null) {
    const activeItem = this.getItemForBlock(activeBlock);

    return {
      type: this.localName,
      label: this.itemLabel,
      count: this.blocks.length,
      min: this.min,
      max: this.max,
      canAdd: this.blocks.length < this.max,
      canDelete: this.blocks.length > this.min && Boolean(activeItem),
      canSort: this.blocks.length > 1,
      items: this.blocks.map((item) => ({
        id: item.groupId,
        label: this.getItemLabel(item),
        active: item === activeItem,
      })),
    };
  }

  addBlock(afterBlock = null) {
    if (this.blocks.length >= this.max) return null;

    const sourceItem = this.getItemForBlock(afterBlock) ?? this.blocks.at(-1);
    const item = this.createItem(this.createId());

    this.placeholderElement?.remove();
    item.init?.(this.createItemData(item.groupId));

    if (sourceItem) {
      sourceItem.after(item);
    } else {
      this.append(item);
    }

    this.syncPlaceholder();
    this.dispatchChange(item);
    return item;
  }

  deleteBlock(block) {
    const item = this.getItemForBlock(block);
    if (!item || this.blocks.length <= this.min) return null;

    const nextItem = item.nextElementSibling?.matches?.(this.itemTag)
      ? item.nextElementSibling
      : item.previousElementSibling?.matches?.(this.itemTag)
        ? item.previousElementSibling
        : null;

    item.remove();
    this.syncPlaceholder();
    this.dispatchChange(nextItem);
    return nextItem;
  }

  reorderBlocks(ids = [], activeBlock = null) {
    const itemsById = new Map(this.blocks.map((item) => [item.groupId, item]));
    const orderedItems = ids.map((id) => itemsById.get(id)).filter(Boolean);
    if (orderedItems.length !== this.blocks.length) return false;

    this.placeholderElement?.remove();
    for (const item of orderedItems) this.append(item);
    this.syncPlaceholder();
    this.dispatchChange(this.getItemForBlock(activeBlock) ?? orderedItems[0] ?? null);
    return true;
  }

  createItem(id) {
    const item = document.createElement(this.itemTag);
    item.groupId = id;
    item.groupType = this.itemType;
    item.setAttribute("group-id", id);
    item.setAttribute("group-type", this.itemType);
    return item;
  }

  createItemData(id) {
    const data = cloneData(this.itemClass?.defaultJson ?? {});
    return {
      ...data,
      id,
      type: this.itemType,
    };
  }

  getItemForBlock(block) {
    if (!block) return null;
    if (this.blocks.includes(block)) return block;
    return this.blocks.find((item) => item.blocks?.includes(block)) ?? null;
  }

  getItemLabel(item) {
    const labelBlock = item.blocks?.find((block) => block.blockId === this.sortLabelBlock);
    const value = labelBlock?.toJSON?.().value ?? labelBlock?.value;
    return htmlToText(value) || this.placeholder;
  }

  copyItemStyles(block) {
    const item = this.getItemForBlock(block);
    return item?.toJSON ? createStyleSnapshot(item.toJSON()) : null;
  }

  async pasteItemStyles(block, snapshot) {
    const item = this.getItemForBlock(block);
    if (!item?.toJSON || !snapshot) return false;

    const itemData = item.toJSON();
    item.init?.({
      ...itemData,
      style: cloneData(snapshot.style),
      blocks: mergeBlockStyles(itemData.blocks, snapshot.blocks),
    });

    await item.updateComplete;
    await Promise.resolve();
    await Promise.all(item.blocks.map((child) => child.updateComplete).filter(Boolean));
    return true;
  }

  ensureMinimumItems() {
    while (this.blocks.length < Math.min(this.min, this.max)) {
      const item = this.createItem(this.createId());
      item.setAttribute("aria-label", `${this.placeholder} ${this.blocks.length + 1}`);
      item.init?.(this.createItemData(item.groupId));
      this.append(item);
    }
    this.syncPlaceholder();
  }

  ensureItemIds() {
    const ids = new Set();

    for (const item of this.blocks) {
      if (!item.groupId || ids.has(item.groupId)) {
        item.groupId = this.createId(ids);
      }
      item.groupType = this.itemType;
      item.setAttribute("group-id", item.groupId);
      item.setAttribute("group-type", this.itemType);
      ids.add(item.groupId);
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
    let id = `${this.prefix}-${randomHash()}`;
    const ids = new Set([...this.blocks.map((item) => item.groupId), ...existingIds]);
    while (ids.has(id)) id = `${this.prefix}-${randomHash()}`;
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

  #assertConfiguration() {
    if (!this.itemTag || !this.itemType) {
      throw new TypeError(`${this.constructor.name} requires static itemTag and itemType values`);
    }
  }
}

function numberAttribute(element, name, fallback) {
  if (!element.hasAttribute(name)) return fallback;

  const value = Number(element.getAttribute(name));
  return Number.isFinite(value) ? value : fallback;
}

function htmlToText(value = "") {
  const template = document.createElement("template");
  template.innerHTML = value;
  return template.content.textContent.replace(/[\u00a0\u200b-\u200d\ufeff]/g, "").trim();
}

function cloneData(value) {
  if (Array.isArray(value)) return value.map(cloneData);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, cloneData(child)]));
}

const STYLE_FIELDS = [
  "align",
  "backgroundColor",
  "bodyBackgroundColor",
  "stripeBackgroundColor",
  "stripedRows",
  "borderColor",
  "borderPosition",
  "borderRadius",
  "borderStyle",
  "borderWidth",
  "color",
  "design",
  "elementType",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "headerBackgroundColor",
  "iconPosition",
  "objectFit",
  "predefinedMargin",
  "textAlign",
];

function createStyleSnapshot(itemData) {
  return {
    style: cloneData(itemData.style ?? {}),
    blocks: (itemData.blocks ?? []).map((block) => ({
      id: block.id,
      style: Object.fromEntries(
        STYLE_FIELDS.filter((field) => Object.hasOwn(block, field)).map((field) => [
          field,
          cloneData(block[field]),
        ]),
      ),
    })),
  };
}

function mergeBlockStyles(targetBlocks = [], sourceBlocks = []) {
  const sourceById = new Map(sourceBlocks.map((block) => [block.id, block.style]));
  return targetBlocks.map((block) => ({
    ...block,
    ...cloneData(sourceById.get(block.id) ?? {}),
  }));
}
