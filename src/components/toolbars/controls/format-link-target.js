import { LinkTargetPickerControl } from "./link-target-picker-control.js";

export class FormatLinkTarget extends LinkTargetPickerControl {
  static command = "linkTarget";
}

customElements.define("format-link-target", FormatLinkTarget);
