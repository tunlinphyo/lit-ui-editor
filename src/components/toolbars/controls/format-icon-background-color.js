import { html } from "lit";
import { PopoverControl } from "./popover-control.js";
import {
  COLOR_WHEEL_GRADIENT,
  DEFAULT_BACKGROUND_COLOR,
  getEditorColorSwatches,
} from "../../../utils/colors.js";
import { formatTextColorPaletteStyles } from "./format-text-color-palette.styles.js";

export class FormatIconBackgroundColor extends PopoverControl {
  static properties = {
    disabled: { type: Boolean },
    value: { type: String, reflect: true },
  };

  static styles = formatTextColorPaletteStyles;

  constructor() {
    super();
    this.disabled = false;
    this.value = DEFAULT_BACKGROUND_COLOR;
  }

  render() {
    return html`
      <button
        class="trigger"
        type="button"
        title="Predefined icon background color"
        popovertarget="colors"
        ?disabled=${this.disabled}
        style=${`--text-color: ${this.value}`}
        @mousedown=${(event) => event.preventDefault()}
      >
        <span class="selected-color" style=${this.value ? `background: ${this.value}` : ""}></span>
        <svg class="color-wheel-icon" viewBox="0 0 24 24" aria-hidden="true" width="20">
          <foreignObject x="3" y="3" width="18" height="18">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style=${`width: 18px; height: 18px; border-radius: 50%; background: ${COLOR_WHEEL_GRADIENT};`}
            ></div>
          </foreignObject>
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="rgba(0, 0, 0, 0.18)"
            stroke-width="1"
          ></circle>
        </svg>
      </button>
      <div id="colors" popover @toggle=${this.handlePopoverToggle}>
        <button
          class="unset"
          type="button"
          title="Unset color"
          aria-label="Unset color"
          @click=${() => this.#apply("")}
        ></button>
        ${getEditorColorSwatches().map((color) =>
          color.spacer
            ? html`<span class="spacer" aria-hidden="true"></span>`
            : html`
                <button
                  class="color"
                  type="button"
                  title=${`${color.label} ${color.value}`}
                  aria-label=${`${color.label} ${color.value}`}
                  aria-pressed=${isSelectedColor(this.value, color.value)}
                  style=${`--color: ${color.value}`}
                  @mousedown=${(event) => event.preventDefault()}
                  @click=${() => this.#apply(color.value)}
                ></button>
              `,
        )}
      </div>
    `;
  }

  #apply(value) {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: "backgroundColor", value },
        bubbles: true,
        composed: true,
      }),
    );
    this.closePopover({ defer: true });
  }
}

customElements.define("format-icon-background-color", FormatIconBackgroundColor);

function isSelectedColor(current, value) {
  return current?.toLowerCase() === value.toLowerCase();
}
