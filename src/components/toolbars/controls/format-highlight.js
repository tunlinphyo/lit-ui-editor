import { css, html } from "lit";
import { markStyles } from "../../blocks/text/mark.styles.js";
import { FormatToggle } from "./format-toggle";

export class FormatHighlight extends FormatToggle {
  command = "highlight";

  static styles = [
    FormatToggle.styles,
    markStyles,
    css`
      button {
        padding: 0 0.5rem;
      }

      .text-mark {
        color: inherit;
        font-size: 0.75rem;
        line-height: 1;
      }
    `,
  ];

  render() {
    return html`<button
      type="button"
      title="Highlight"
      ?disabled=${this.disabled}
      @click=${() => this.apply()}
    >
      <span class="text-mark">Mark</span>
    </button>`;
  }
}

customElements.define("format-highlight", FormatHighlight);
