import { html } from "lit";
import { groupStyleSelectorStyles } from "../group-format-toolbar/group-style-selector.styles.js";
import { PickerPopoverControl } from "./picker-popover-control.js";

export class BlockStyleSelector extends PickerPopoverControl {
  static includeCurrentOption = true;

  get options() {
    const options = super.options;
    if (
      !this.constructor.includeCurrentOption ||
      !this.value ||
      options.some((option) => option.value === this.value)
    ) {
      return options;
    }

    return [{ value: this.value, label: `Default` }, ...options];
  }

  dispatchValueChange(value) {
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: "blockStyle", property: this.property, value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

export class BlockBorderWidth extends BlockStyleSelector {
  static configKey = "border-width";
  static title = "Border width";

  property = "borderWidth";
}

export class BlockBorderStyle extends BlockStyleSelector {
  static configKey = "border-style";
  static title = "Border style";
  static fallbackLabel = "None";

  property = "borderStyle";

  renderTriggerLabel(option) {
    return option?.value ? this.#renderStyle(option) : "None";
  }

  renderOptionLabel(option) {
    return option.value ? this.#renderStyle(option) : "None";
  }

  #renderStyle(option) {
    return html`<span class="border-style-preview" style="--border-style: ${option.value}"></span>`;
  }
}

class ImageBorderWidth extends BlockBorderWidth {}
class ButtonBorderWidth extends BlockBorderWidth {}

class ImageBorderStyle extends BlockBorderStyle {}
class ButtonBorderStyle extends BlockBorderStyle {}

class ImageBorderPosition extends BlockStyleSelector {
  static configKey = "border-position";
  static includeCurrentOption = false;
  static styles = groupStyleSelectorStyles;

  label = "Border Position";
  property = "borderPosition";

  render() {
    const selected = parseBorderPositions(this.value);

    return html`
      <div class="border-position-group" role="group" aria-label=${this.label}>
        ${this.options.map(
          ({ value, label }) => html`
            <button
              class="border-position-option"
              type="button"
              title=${label}
              aria-label=${label}
              aria-pressed=${value ? selected.has(value) : !this.value}
              data-position=${value || "all"}
              ?disabled=${this.disabled}
              @click=${() => this.#toggleValue(value)}
            >
              <span class="border-position-icon" aria-hidden="true"></span>
            </button>
          `,
        )}
      </div>
    `;
  }

  #toggleValue(value) {
    this.value = value ? toggleBorderPosition(this.value, value) : "";
    this.dispatchEvent(
      new CustomEvent("format-command", {
        detail: { command: "blockStyle", property: this.property, value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

class IconBorderWidth extends BlockBorderWidth {}
class IconBorderStyle extends BlockBorderStyle {}
class IconBorderPosition extends ImageBorderPosition {}
class ButtonBorderPosition extends ImageBorderPosition {}

customElements.define("image-border-width", ImageBorderWidth);
customElements.define("image-border-style", ImageBorderStyle);
customElements.define("image-border-position", ImageBorderPosition);
customElements.define("icon-border-width", IconBorderWidth);
customElements.define("icon-border-style", IconBorderStyle);
customElements.define("icon-border-position", IconBorderPosition);
customElements.define("button-border-width", ButtonBorderWidth);
customElements.define("button-border-style", ButtonBorderStyle);
customElements.define("button-border-position", ButtonBorderPosition);

function parseBorderPositions(value) {
  return new Set(
    String(value || "")
      .split(/\s+/)
      .filter(Boolean),
  );
}

function toggleBorderPosition(current, position) {
  const positions = ["top", "right", "bottom", "left"];
  const selected = parseBorderPositions(current);

  if (selected.has(position)) selected.delete(position);
  else selected.add(position);

  const value = positions.filter((side) => selected.has(side));
  return !value.length || value.length === positions.length ? "" : value.join(" ");
}
