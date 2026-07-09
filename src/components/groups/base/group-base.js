import { LitElement, html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import { groupBaseStyles } from "./group-base.styles.js";
import { getBlockSelector } from "../../../registries/block-registry.js";
import { registerGroup } from "../../../registries/group-registry.js";
import { getListSelector } from "../../../registries/list-registry.js";
import { FEATURES, parseFeatures } from "../../../registries/formatter-registry.js";

export const GROUP_FEATURES = {
  backgroundColor: FEATURES.backgroundColor,
  border: FEATURES.border,
  borderRadius: FEATURES.borderRadius,
  link: FEATURES.link,
  linkTarget: FEATURES.linkTarget,
  disabled: FEATURES.disabled,
  blockGroup: "blockGroup",
};

const DEFAULT_GROUP_FEATURES = [
  GROUP_FEATURES.backgroundColor,
  GROUP_FEATURES.border,
  GROUP_FEATURES.borderRadius,
  GROUP_FEATURES.blockGroup,
];

export class GroupBase extends LitElement {
  static define(tagName, definition = {}) {
    const type = definition.type ?? tagName.replace(/-group$/, "");

    customElements.define(tagName, this);
    registerGroup({
      ...definition,
      type,
      tagName,
      selector: definition.selector ?? tagName,
      label: definition.label ?? type,
    });

    return this;
  }

  static properties = {
    groupId: { type: String, attribute: "group-id", reflect: true },
    groupType: { type: String, attribute: "group-type", reflect: true },
    hashId: { type: String, attribute: "hash-id", reflect: true },
    sort: { type: Number, reflect: true },
    backgroundColor: { type: String, attribute: "background-color", reflect: true },
    borderWidth: { type: String, attribute: "border-width", reflect: true },
    borderColor: { type: String, attribute: "border-color", reflect: true },
    borderStyle: { type: String, attribute: "border-style", reflect: true },
    borderPosition: { type: String, attribute: "border-position", reflect: true },
    borderRadius: { type: String, attribute: "border-radius", reflect: true },
  };

  static defaultJson = {
    blocks: [],
  };

  constructor() {
    super();
    this.groupId = "";
    this.groupType = "";
    this.hashId = "";
    this.sort = 0;
    this.backgroundColor = "";
    this.borderWidth = "";
    this.borderColor = "";
    this.borderStyle = "";
    this.borderPosition = "";
    this.borderRadius = "";
  }

  static styles = [groupBaseStyles, materialSymbolStyles];

  get blocks() {
    return [...this.renderRoot.querySelectorAll(getBlockSelector())];
  }

  renderSortControls() {
    const groups = this.#getGroups();

    return html`
      ${this.hashId ? html`<div class="hash-id-label" part="hash-id">#${this.hashId}</div>` : ""}
      <div class="sort-controls" part="sort-controls">
        <div class="button-group">
          <button
            type="button"
            aria-label="Move group up"
            title="Move group up"
            ?disabled=${groups[0] === this}
            @click=${() => this.#requestMove(-1)}
          >
            ${renderMaterialIcon("keyboard_arrow_up")}
          </button>
          <button
            type="button"
            aria-label="Move group down"
            title="Move group down"
            ?disabled=${groups.at(-1) === this}
            @click=${() => this.#requestMove(1)}
          >
            ${renderMaterialIcon("keyboard_arrow_down")}
          </button>
          <button
            type="button"
            aria-label="Add group below"
            title="Add group below"
            @click=${this.#requestGroupBelow}
          >
            ${renderMaterialIcon("add")}
          </button>
          <button
            type="button"
            aria-label="Set hash link"
            title="Set hash link"
            @click=${this.#requestHashEdit}
          >
            ${renderMaterialIcon("tag")}
          </button>
          <button
            type="button"
            aria-label="Delete group"
            title="Delete group"
            @click=${this.#requestDelete}
          >
            ${renderMaterialIcon("delete")}
          </button>
        </div>
      </div>
    `;
  }

  init({ blocks = [], style = {}, hashId = "" } = {}) {
    this.hashId = normalizeHashId(hashId);
    this.backgroundColor = style.backgroundColor ?? "";
    this.borderWidth = style.borderWidth ?? "";
    this.borderColor = style.borderColor ?? "";
    this.borderStyle = style.borderStyle ?? "";
    this.borderPosition = style.borderPosition ?? "";
    this.borderRadius = style.borderRadius ?? "";

    void this.updateComplete.then(() => {
      const blocksById = new Map(this.blocks.map((block) => [block.blockId, block]));
      const listsById = new Map(
        this.#getDataLists().map((list) => [list.getAttribute("block-id"), list]),
      );

      for (const blockData of blocks) {
        const list = listsById.get(blockData.id);
        if (list) {
          list.setBlockData?.(Array.isArray(blockData.children) ? blockData.children : []);
        } else {
          blocksById.get(blockData.id)?.init(blockData);
        }
      }
    });
    return this;
  }

  async focusFirstBlock() {
    await this.updateComplete;

    const firstBlock = this.blocks[0];
    if (!firstBlock) return false;

    await firstBlock.updateComplete;

    const focusTarget = firstBlock.renderRoot.querySelector(".editor, .input:not(:disabled)");
    if (!focusTarget) return false;

    focusTarget.focus();
    return true;
  }

  toJSON() {
    const dataLists = new Set(this.#getDataLists());

    return {
      id: this.groupId,
      type: this.groupType || this.localName.replace(/-group$/, ""),
      hashId: this.hashId,
      sort: this.sort,
      style: this.getGroupStyle(),
      blocks: this.#getDataBlocks().map((block) => {
        if (!dataLists.has(block)) return block.toJSON();

        return {
          id: block.getAttribute("block-id"),
          type: block.getAttribute("block-type") || block.getAttribute("block-id"),
          children: block.blocks.map((item, sort) => ({
            ...item.toJSON(),
            sort,
          })),
        };
      }),
    };
  }

  #getDataLists() {
    const selector = getListSelector();
    if (!selector) return [];
    return [...this.renderRoot.querySelectorAll(selector)].filter((list) =>
      list.hasAttribute("block-id"),
    );
  }

  #getDataBlocks() {
    const listSelector = getListSelector();
    const selector = [getBlockSelector(), listSelector].filter(Boolean).join(", ");
    if (!selector) return [];

    return [...this.renderRoot.querySelectorAll(selector)].filter((block) => {
      if (listSelector && block.matches(listSelector)) {
        return block.hasAttribute("block-id");
      }

      const list = listSelector ? block.closest(listSelector) : null;
      return !list?.hasAttribute("block-id");
    });
  }

  setGroupStyle(property, value) {
    if (!this.#canSetGroupStyle(property)) return false;

    if (
      ![
        "backgroundColor",
        "borderWidth",
        "borderColor",
        "borderStyle",
        "borderPosition",
        "borderRadius",
      ].includes(property)
    ) {
      return false;
    }

    this[property] = value;
    if (property === "borderColor" && !value) {
      this.borderWidth = "";
      this.borderStyle = "";
    }
    if (property === "borderStyle" && (!value || value === "none")) {
      this.borderWidth = "";
      this.borderColor = null;
      this.borderPosition = "";
    }
    if (property === "borderWidth" && value && !this.borderStyle) this.borderStyle = "solid";
    if (property === "borderStyle" && value && value !== "none" && !this.borderWidth) {
      this.borderWidth = "1px";
    }
    this.#dispatchFormat();
    return true;
  }

  setHashId(value) {
    this.hashId = normalizeHashId(value);
    return this.hashId;
  }

  getGroupFormat() {
    return {
      ...this.getGroupStyle(),
      capabilities: getGroupCapabilities(this.constructor.features),
    };
  }

  getGroupStyle() {
    return {
      backgroundColor: this.backgroundColor,
      borderWidth: this.borderWidth,
      borderColor: this.borderColor,
      borderStyle: this.borderStyle,
      borderPosition: this.borderPosition,
      borderRadius: this.borderRadius,
    };
  }

  #canSetGroupStyle(property) {
    const feature = getGroupStyleFeature(property);
    if (!feature) return true;

    return getGroupCapabilities(this.constructor.features)[feature] !== false;
  }

  #requestMove(offset) {
    this.dispatchEvent(
      new CustomEvent("move-group-request", {
        bubbles: true,
        detail: { group: this, offset },
      }),
    );
  }

  #requestGroupBelow = () => {
    this.dispatchEvent(
      new CustomEvent("add-group-request", {
        bubbles: true,
        detail: { after: this },
      }),
    );
  };

  #requestDelete = () => {
    this.dispatchEvent(
      new CustomEvent("delete-group-request", {
        bubbles: true,
        detail: { group: this },
      }),
    );
  };

  #requestHashEdit = () => {
    this.dispatchEvent(
      new CustomEvent("hash-group-request", {
        bubbles: true,
        detail: { group: this },
      }),
    );
  };

  #getGroups() {
    return [...(this.parentElement?.children ?? [])].filter(
      (element) => element instanceof GroupBase,
    );
  }

  updated(changedProperties) {
    if (changedProperties.has("sort")) {
      this.style.removeProperty("order");
    }
    if (changedProperties.has("hashId")) {
      if (this.hashId) {
        this.id = this.hashId;
      } else {
        this.removeAttribute("id");
      }
    }
    const groupBox = this.renderRoot.querySelector("[data-group-box]");
    if (!groupBox) return;

    if (changedProperties.has("backgroundColor")) {
      groupBox.style.backgroundColor = this.backgroundColor;
    }
    if (changedProperties.has("borderWidth") || changedProperties.has("borderPosition")) {
      groupBox.style.borderWidth = toBorderWidthValue(this.borderWidth, this.borderPosition);
    }
    if (changedProperties.has("borderColor")) {
      groupBox.style.borderColor = this.borderColor;
    }
    if (changedProperties.has("borderStyle")) {
      groupBox.style.borderStyle = this.borderStyle;
    }
    if (changedProperties.has("borderRadius")) {
      groupBox.style.borderRadius = this.borderRadius;
    }
  }

  #dispatchFormat() {
    this.dispatchEvent(
      new CustomEvent("group-format-change", {
        detail: this.getGroupFormat(),
        bubbles: true,
        composed: true,
      }),
    );
  }
}

function normalizeHashId(value) {
  return String(value ?? "")
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-");
}

function toBorderWidthValue(width, position) {
  if (!width || !position) return width;

  const selected = new Set(String(position).split(/\s+/).filter(Boolean));
  const positions = ["top", "right", "bottom", "left"];
  if (!selected.size || positions.every((side) => selected.has(side))) return width;

  return positions.map((side) => (selected.has(side) ? width : "0")).join(" ");
}

function getGroupCapabilities(features) {
  const featureList = parseFeatures(features) ?? DEFAULT_GROUP_FEATURES;
  const capabilities = {};

  for (const feature of Object.values(GROUP_FEATURES)) capabilities[feature] = false;
  for (const feature of featureList) capabilities[feature] = true;

  return capabilities;
}

function getGroupStyleFeature(property) {
  if (property === "backgroundColor") return GROUP_FEATURES.backgroundColor;
  if (["borderWidth", "borderColor", "borderStyle", "borderPosition"].includes(property)) {
    return GROUP_FEATURES.border;
  }
  if (property === "borderRadius") return GROUP_FEATURES.borderRadius;
  return null;
}
