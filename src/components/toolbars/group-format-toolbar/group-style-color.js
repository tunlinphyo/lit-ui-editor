import { html, nothing } from "lit";
import { PopoverControl } from "../controls/popover-control.js";
import { COLOR_WHEEL_GRADIENT, getEditorColorSwatches } from "../../../utils/colors.js";
import { groupStyleColorStyles } from "./group-style-color.styles.js";

class GroupStyleColor extends PopoverControl {
  static properties = {
    value: { type: String, reflect: true },
    disabled: { type: Boolean },
    showLabel: { type: Boolean, attribute: "show-label" },
  };

  static styles = groupStyleColorStyles;

  constructor() {
    super();
    this.value = "";
    this.disabled = true;
    this.showLabel = true;
  }

  render() {
    return html`
      <div class="label-group">
        ${this.showLabel ? html`<span>${this.label}</span>` : nothing}
        <button
          class="trigger"
          type="button"
          title=${`Predefined ${this.label.toLowerCase()} color`}
          popovertarget="colors"
          ?disabled=${this.disabled}
        >
          <span
            class="selected-color"
            style=${this.value ? `background: ${this.value}` : ""}
          ></span>
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
      </div>
      <div id="colors" popover @toggle=${this.handlePopoverToggle}>
        <button
          class="unset"
          type="button"
          title="Unset color"
          aria-label="Unset color"
          @click=${() => this.#applyValue("")}
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
                  @click=${() => this.#applyValue(color.value)}
                ></button>
              `,
        )}
      </div>
    `;
  }

  #applyValue(value) {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent("group-style-change", {
        detail: { property: this.property, value },
        bubbles: true,
        composed: true,
      }),
    );
    this.closePopover();
  }
}

class GroupBackgroundColor extends GroupStyleColor {
  label = "Background Color";
  property = "backgroundColor";
}

class GroupBorderColor extends GroupStyleColor {
  label = "Border Color";
  property = "borderColor";

  constructor() {
    super();
    this.showLabel = false;
  }
}

customElements.define("group-background-color", GroupBackgroundColor);
customElements.define("group-border-color", GroupBorderColor);

function isSelectedColor(current, value) {
  return current?.toLowerCase() === value.toLowerCase();
}
