import { PickerPopoverControl } from "./picker-popover-control.js";

export class FormatButtonIconPlacement extends PickerPopoverControl {
  static configKey = "button-icon-placement";
  static command = "buttonIconPlacement";
  static popoverId = "button-icon-placements";
  static title = "Button icon";
  static fallbackLabel = "Button icon";

  constructor() {
    super();
    this.value = "none";
  }
}

customElements.define("format-button-icon-placement", FormatButtonIconPlacement);
