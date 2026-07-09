import { LinkTargetPickerControl } from "./link-target-picker-control.js";

export class FormatIconLinkTarget extends LinkTargetPickerControl {
  static command = "iconLinkTarget";
}

customElements.define("format-icon-link-target", FormatIconLinkTarget);
