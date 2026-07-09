import { PickerPopoverControl } from "./picker-popover-control.js";

export class LinkTargetPickerControl extends PickerPopoverControl {
  static configKey = "link-target";
  static popoverId = "link-targets";
  static title = "Link target";

  constructor() {
    super();
    this.value = "_self";
  }
}
