import { html } from "lit";
import { FormatToggle } from "./format-toggle";

export class FormatBold extends FormatToggle {
  command = "bold";

  render() {
    return html`<button
      type="button"
      title="Bold"
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      <strong>B</strong>
    </button>`;
  }
}

customElements.define("format-bold", FormatBold);
