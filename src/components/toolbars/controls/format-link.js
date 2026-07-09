import { html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import { PopoverControl } from "./popover-control.js";
import { formatLinkStyles } from "./format-link.styles.js";

export class FormatLink extends PopoverControl {
  static properties = {
    applied: { type: Boolean, reflect: true },
    disabled: { type: Boolean },
    open: { type: Boolean, reflect: true },
    value: { type: String },
  };

  static styles = [formatLinkStyles, materialSymbolStyles];

  constructor() {
    super();
    this.applied = false;
    this.disabled = false;
    this.open = false;
    this.value = "";
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (!changedProperties.has("open")) return;

    const popover = this.popover;
    if (!popover) return;
    if (this.open) {
      if (!popover.matches(":popover-open")) popover.showPopover();
      this.renderRoot.querySelector("input")?.focus();
      return;
    }

    this.closePopover();
  }

  #toggle = () => {
    if (this.open) {
      this.open = false;
      this.#dispatchLinkCancel();
    } else {
      this.open = true;
      this.#dispatchLinkEdit();
    }
  };

  #save = (event) => {
    event.preventDefault();
    const value = this.renderRoot.querySelector("input").value.trim();
    if (!value) return;

    this.value = value;
    this.#dispatchLink(value);
    this.#close();
  };

  #remove = () => {
    this.#dispatchLink();
    this.#close();
  };

  #close() {
    this.open = false;
  }

  #togglePopover = (event) => {
    if (event.newState !== "closed" || !this.open) return;

    this.open = false;
    this.#dispatchLinkCancel();
  };

  #dispatchLink(value = null) {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: "link", value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchLinkEdit() {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: "linkEdit" },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchLinkCancel() {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: "linkCancel" },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <button
        type="button"
        title=${this.applied ? "Edit link" : "Add link"}
        ?disabled=${this.disabled}
        @mousedown=${(event) => event.preventDefault()}
        @click=${this.#toggle}
        aria-label=${this.applied ? "Edit link" : "Add link"}
      >
        ${renderMaterialIcon("link")}
      </button>
      <div popover @toggle=${this.#togglePopover}>
        <form @mousedown=${(event) => event.stopPropagation()} @submit=${this.#save}>
          <input type="url" placeholder="https://example.com" .value=${this.value} required />
          <button class="btn-save" type="submit" title="Save" aria-label="Save">
            ${renderMaterialIcon("check")}
          </button>
          <button
            class="btn-remove"
            type="button"
            title="Remove link"
            aria-label="Remove link"
            @click=${this.#remove}
          >
            ${renderMaterialIcon("delete")}
          </button>
        </form>
      </div>
    `;
  }
}

customElements.define("format-link", FormatLink);
