import { html } from "lit";
import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatToggle } from "./format-toggle";

export class FormatItalic extends FormatToggle {
  command = "italic";

  render() {
    return html`<button
      type="button"
      title="Italic"
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      ${renderMaterialIcon("format_italic")}
    </button>`;
  }
}

customElements.define("format-italic", FormatItalic);
