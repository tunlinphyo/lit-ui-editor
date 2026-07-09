import { html } from "lit";
import { PickerPopoverControl } from "./picker-popover-control.js";
import { elementTypeSelectorStyles } from "./element-type-selector.styles.js";
import { pickerPopoverControlStyles } from "./picker-popover-control.styles.js";

export class ElementTypeSelector extends PickerPopoverControl {
  static configKey = "element-type";
  static styles = [pickerPopoverControlStyles, elementTypeSelectorStyles];
  static popoverId = "element-types";
  static title = "Element type";
  static fallbackLabel = "Body";

  constructor() {
    super();
    this.value = "p";
  }

  renderOptionLabel(option) {
    return option.className
      ? html`<span class=${option.className}>${option.label}</span>`
      : option.label;
  }

  dispatchValueChange(value) {
    this.dispatchEvent(
      new CustomEvent("element-type-change", {
        detail: { type: value },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("element-type-selector", ElementTypeSelector);
