import { html } from "lit";
import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { PopoverControl } from "./popover-control.js";

export class LinkPopoverControl extends PopoverControl {
  static properties = {
    applied: { type: Boolean, reflect: true },
    value: { type: String },
  };

  static command = "";
  static subject = "";

  constructor() {
    super();
    this.applied = false;
    this.value = "";
  }

  render() {
    const { subject } = this.constructor;
    const title = this.applied ? `Edit ${subject} link` : `Add ${subject} link`;

    return html`
      <button
        type="button"
        title=${title}
        aria-label=${title}
        popovertarget="link-editor"
        ?disabled=${this.disabled}
      >
        ${renderMaterialIcon("link")}
      </button>
      <div id="link-editor" popover @toggle=${this.handlePopoverToggle}>
        <form @submit=${this.handleSave}>
          <input
            type="text"
            inputmode="url"
            placeholder="/page or https://example.com"
            pattern="(/.*|https?://.+)"
            .value=${this.value}
            required
          />
          <button class="btn-save" type="submit" title="Save" aria-label="Save">
            ${renderMaterialIcon("check")}
          </button>
          <button
            class="btn-remove"
            type="button"
            title="Remove link"
            aria-label="Remove link"
            @click=${this.handleRemove}
          >
            ${renderMaterialIcon("delete")}
          </button>
        </form>
      </div>
    `;
  }

  handleSave = (event) => {
    event.preventDefault();
    const value = this.renderRoot.querySelector("input").value.trim();
    if (!value) return;

    this.dispatchValue(value);
    this.closePopover();
  };

  handleRemove = () => {
    this.dispatchValue("");
    this.closePopover();
  };

  handlePopoverToggle = (event) => {
    if (event.newState === "open") {
      this.renderRoot.querySelector("input")?.focus();
      return;
    }

    this.onPopoverClosed();
  };

  dispatchValue(value) {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: this.constructor.command, value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
