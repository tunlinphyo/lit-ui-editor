import { html } from "lit";
import { PickerPopoverControl } from "./picker-popover-control.js";

export class FormatFontFamily extends PickerPopoverControl {
  static configKey = "font-family";
  static command = "fontFamily";
  static popoverId = "font-families";
  static title = "Font family";
  static fallbackLabel = "Font";
  // The toolbar value can lag behind the active block during a selection
  // change, so selecting the displayed family must still apply it.
  static reapplySelectedValue = true;

  constructor() {
    super();
  }

  renderOptionLabel(option) {
    return option.value
      ? html`<span style="font-family: ${option.value}">${option.label}</span>`
      : option.label;
  }
}

customElements.define("format-font-family", FormatFontFamily);
