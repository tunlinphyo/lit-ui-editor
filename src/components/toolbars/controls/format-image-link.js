import { materialSymbolStyles } from "../../icon-picker/material-icon-picker.js";
import { LinkPopoverControl } from "./link-popover-control.js";
import { formatLinkStyles } from "./format-link.styles.js";

export class FormatImageLink extends LinkPopoverControl {
  static styles = [formatLinkStyles, materialSymbolStyles];
  static command = "imageLink";
  static subject = "image";
}

customElements.define("format-image-link", FormatImageLink);
