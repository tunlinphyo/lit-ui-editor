import { PickerPopoverControl } from "./picker-popover-control.js";

export class FormatFontSize extends PickerPopoverControl {
  static configKey = "font-size";
  static command = "fontSize";
  static popoverId = "font-sizes";
  static title = "Font size";
  static fallbackLabel = "Default";

  // constructor() {
  //   super();
  // }

  // renderOptionLabel(option) {
  //   return option.value
  //     ? html`<span style="font-size: ${option.value}">${option.label}</span>`
  //     : option.label;
  // }
}

customElements.define("format-font-size", FormatFontSize);
