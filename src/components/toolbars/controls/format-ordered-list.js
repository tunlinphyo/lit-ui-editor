import { html } from "lit";
import { renderMaterialIcon } from "../../icon-picker/material-icon-picker.js";
import { FormatToggle } from "./format-toggle";

const orderedListIcon = renderMaterialIcon("format_list_numbered");

export class FormatOrderedList extends FormatToggle {
  command = "insertOrderedList";

  render() {
    return html`<button
      type="button"
      title="Ordered list"
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      ${orderedListIcon}
    </button>`;
  }
}

customElements.define("format-ordered-list", FormatOrderedList);
