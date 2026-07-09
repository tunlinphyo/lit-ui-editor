import { LinkTargetPickerControl } from "./link-target-picker-control.js";

export class FormatButtonLinkTarget extends LinkTargetPickerControl {
  static command = "buttonLinkTarget";
}

customElements.define("format-button-link-target", FormatButtonLinkTarget);
