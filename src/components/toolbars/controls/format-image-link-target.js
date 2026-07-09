import { LinkTargetPickerControl } from "./link-target-picker-control.js";

export class FormatImageLinkTarget extends LinkTargetPickerControl {
  static command = "imageLinkTarget";
}

customElements.define("format-image-link-target", FormatImageLinkTarget);
