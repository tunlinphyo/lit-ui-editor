import { html } from "lit";
import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatToggle } from "./format-toggle";

export class FormatDisabled extends FormatToggle {
  command = "disabled";

  render() {
    return html`<button
      type="button"
      title=${this.applied ? "Enable" : "Disable"}
      aria-label=${this.applied ? "Enable" : "Disable"}
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      ${renderMaterialIcon("block")}
    </button>`;
  }
}

customElements.define("format-disabled", FormatDisabled);
