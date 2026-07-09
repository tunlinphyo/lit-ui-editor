import { LitElement, css, html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import { formatToggleStyles } from "./format-toggle.styles.js";
import "./sort-list-control.js";

export class BlockGroupFilter extends LitElement {
  static properties = {
    hidden: { type: Boolean, reflect: true },
    disabled: { type: Boolean },
    canAdd: { type: Boolean, attribute: "can-add" },
    canDelete: { type: Boolean, attribute: "can-delete" },
    count: { type: Number },
    min: { type: Number },
    max: { type: Number },
    styleAction: { type: String, attribute: "style-action" },
  };

  static styles = [
    formatToggleStyles,
    materialSymbolStyles,
    css`
      :host {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        gap: 0.25rem;
      }
    `,
  ];

  constructor() {
    super();
    this.hidden = true;
    this.disabled = true;
    this.canAdd = false;
    this.canDelete = false;
    this.count = 0;
    this.min = 0;
    this.max = 0;
    this.styleAction = "";
  }

  render() {
    return html`
      <button
        type="button"
        title=${`Add nav item (${this.count}/${this.max})`}
        aria-label="Add nav item"
        ?disabled=${this.disabled || !this.canAdd}
        @click=${() => this.#apply("add")}
      >
        ${renderMaterialIcon("add")}
      </button>
      <button
        type="button"
        title=${`Delete nav item (${this.count}/${this.min})`}
        aria-label="Delete nav item"
        ?disabled=${this.disabled || !this.canDelete}
        @click=${() => this.#apply("delete")}
      >
        ${renderMaterialIcon("delete")}
      </button>
      <block-group-sort></block-group-sort>
      <button
        type="button"
        title=${this.styleAction === "paste" ? "Paste styles" : "Copy styles"}
        aria-label=${this.styleAction === "paste" ? "Paste styles" : "Copy styles"}
        ?disabled=${this.disabled || !this.styleAction}
        @click=${() => this.#apply(`${this.styleAction}-styles`)}
      >
        ${this.styleAction === "paste"
          ? renderMaterialIcon("content_paste")
          : renderMaterialIcon("content_copy")}
      </button>
    `;
  }

  updated() {
    this.renderRoot.querySelector("block-group-sort")?.setFormat(this.#format);
  }

  setFormat(format) {
    this.#format = format;
    this.renderRoot.querySelector("block-group-sort")?.setFormat(format);
    this.hidden = !format;
    this.disabled = !format;
    this.canAdd = Boolean(format?.canAdd);
    this.canDelete = Boolean(format?.canDelete);
    this.count = format?.count ?? 0;
    this.min = format?.min ?? 0;
    this.max = format?.max ?? 0;
    this.styleAction = format?.styleAction ?? "";
  }

  #apply(action) {
    this.dispatchEvent(
      new CustomEvent("block-group-command", {
        detail: { action },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #format = null;
}

customElements.define("block-group-filter", BlockGroupFilter);
