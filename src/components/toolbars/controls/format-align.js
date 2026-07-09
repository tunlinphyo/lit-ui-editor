import { css, html } from "lit";
import { materialSymbolStyles } from "../../icon-picker/material-icon-picker.js";
import { FormatToggle } from "./format-toggle";
import { formatToggleStyles } from "./format-toggle.styles.js";

export class FormatAlign extends FormatToggle {
  static styles = [
    formatToggleStyles,
    materialSymbolStyles,
    css`
      button {
        width: 100%;
        height: 1.5rem;
      }
    `,
  ];

  render() {
    return html`<button
      type="button"
      title=${this.label}
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      ${this.icon}
    </button>`;
  }
}
