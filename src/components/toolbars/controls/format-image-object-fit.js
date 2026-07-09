import { PickerPopoverControl } from "./picker-popover-control.js";

export class FormatImageObjectFit extends PickerPopoverControl {
  static configKey = "object-fit";
  static command = "objectFit";
  static popoverId = "object-fit-options";
  static title = "Object fit";

  constructor() {
    super();
    this.value = "none";
  }
}

customElements.define("format-image-object-fit", FormatImageObjectFit);
