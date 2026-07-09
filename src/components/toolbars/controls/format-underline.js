import { html } from "lit";
import { FormatToggle } from "./format-toggle";

export class FormatUnderline extends FormatToggle {
  command = "underline";

  render() {
    return html`<button
      type="button"
      title="Underline"
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      <u>U</u>
    </button>`;
  }
}

customElements.define("format-underline", FormatUnderline);
