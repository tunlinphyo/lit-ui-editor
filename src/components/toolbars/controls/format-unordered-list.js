import { html } from "lit";
import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatToggle } from "./format-toggle";

const unorderedListIcon = renderMaterialIcon("format_list_bulleted");

export class FormatUnorderedList extends FormatToggle {
  command = "insertUnorderedList";

  render() {
    return html`<button
      type="button"
      title="Unordered list"
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      ${unorderedListIcon}
    </button>`;
  }
}

customElements.define("format-unordered-list", FormatUnorderedList);
