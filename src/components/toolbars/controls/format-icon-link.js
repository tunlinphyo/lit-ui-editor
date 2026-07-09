import { materialSymbolStyles } from "../../icon-picker/material-icon-picker.js";
import { LinkPopoverControl } from "./link-popover-control.js";
import { formatLinkStyles } from "./format-link.styles.js";

export class FormatIconLink extends LinkPopoverControl {
  static styles = [formatLinkStyles, materialSymbolStyles];
  static command = "iconLink";
  static subject = "icon";
}

customElements.define("format-icon-link", FormatIconLink);
