import { css, html } from "lit";
import {
  materialSymbolStyles,
  renderMaterialIcon,
} from "../../icon-picker/material-icon-picker.js";
import { BlockBorderStyle, BlockBorderWidth, BlockStyleSelector } from "./block-style-selector.js";
import { groupStyleSelectorStyles } from "../group-format-toolbar/group-style-selector.styles.js";

class TableBorderWidth extends BlockBorderWidth {}

class TableBorderStyle extends BlockBorderStyle {}

class TableBorderPosition extends BlockStyleSelector {
  static includeCurrentOption = false;
  static options = [
    { value: "horizontal", position: "horizontal", label: "Horizontal borders" },
    { value: "vertical", position: "vertical", label: "Vertical borders" },
    { value: "border_outer", position: "outer", label: "Outer borders" },
  ];
  static styles = [
    groupStyleSelectorStyles,
    materialSymbolStyles,
    css`
      .border-position-group {
        grid-template-columns: repeat(3, 1fr);
      }
    `,
  ];

  label = "Border Position";
  property = "borderPosition";

  render() {
    return html`
      <div class="border-position-group" role="group" aria-label=${this.label}>
        ${this.options.map(
          ({ value, position, label }) => html`
            <button
              class="border-position-option"
              type="button"
              title=${label}
              aria-label=${label}
              aria-pressed=${hasBorderPosition(this.value, value)}
              data-position=${position}
              ?disabled=${this.disabled}
              @click=${() => this.#applyValue(value)}
            >
              ${renderMaterialIcon(`border_${position}`)}
            </button>
          `,
        )}
      </div>
    `;
  }

  #applyValue(value) {
    const nextValue = toggleBorderPosition(this.value, value);
    this.value = nextValue;
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: "blockStyle", property: this.property, value: nextValue },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("table-border-width", TableBorderWidth);
customElements.define("table-border-style", TableBorderStyle);
customElements.define("table-border-position", TableBorderPosition);

const TABLE_BORDER_POSITIONS = ["horizontal", "vertical", "border_outer"];

function getBorderPositions(value) {
  return new Set(
    String(value ?? "")
      .split(/\s+/)
      .filter(Boolean),
  );
}

function hasBorderPosition(currentValue, value) {
  return getBorderPositions(currentValue).has(value);
}

function toggleBorderPosition(currentValue, value) {
  const positions = getBorderPositions(currentValue);
  if (positions.has(value)) {
    positions.delete(value);
  } else {
    positions.add(value);
  }

  return TABLE_BORDER_POSITIONS.filter((position) => positions.has(position)).join(" ");
}
